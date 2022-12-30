import { useCallback, useEffect, useState } from 'react';
import { Intent } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { useStyles } from './Ledger.styles';
import { useBudgetContext } from '../context';
import { BudgetAuthResponse, LedgerDataItem, MessageType, PartialLedgerDataItem } from '../types';
import { LedgerNav } from './LedgerNav';
import { getMessage, updateItemBalances } from '../utils/ledger';
import { copyBudget, createEntry, deleteEntry, getBudgetGuid, getBudgetItems, updateEntry } from '../utils/api';
import { Dialog } from './Dialog';
import { Toaster } from './Toaster';
import { Table } from './Table';
import { APP } from '../constants/app';

export const Ledger = () => {
  const classes = useStyles();
  const history = useHistory();
  const { budgetGuid, setBudgetGuid, budgetYear, setBudgetYear, ledgerData, setLedgerData } = useBudgetContext();
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemToDelete, setItemToDelete] = useState<number>();
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    async function checkBudgetGuid() {
      if (!budgetGuid) {
        const budgetAuthResponse: BudgetAuthResponse = await getBudgetGuid();
        setBudgetGuid(budgetAuthResponse.budgetGuid);
      }
    }
    checkBudgetGuid();
  });

  const reloadLedgerData = useCallback(async () => {
    setIsLoading(true);
    setLedgerData({ items: [] });
    const newLedgerData = await getBudgetItems(budgetGuid, String(budgetYear));
    newLedgerData.items = updateItemBalances(newLedgerData);
    setLedgerData(newLedgerData);
    setIsLoading(false);
  }, [budgetGuid, budgetYear, setLedgerData]);

  useEffect(() => {
    if (budgetGuid) {
      reloadLedgerData();
      window.document.title = `${budgetYear} Budget`;
    }
  }, [budgetGuid, budgetYear, reloadLedgerData, setLedgerData]);

  const scrollToMonth = (target: string, event?: React.MouseEvent<HTMLElement, MouseEvent>): boolean => {
    event?.preventDefault();
    const el = document.getElementById(target);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
      return true;
    } else {
      console.log('Cannot find target', target);
      return false;
    }
  }

  const confirmDeletion = (event: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
    event.preventDefault();
    setItemToDelete(index);
    setDialogMessage(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[index]));
    openDeleteDialog();
  };

  const deleteItem = async () => {
    setIsDeleteDialogOpen(false);
    if (itemToDelete) {
      const success = await deleteEntry(budgetGuid, ledgerData.items[itemToDelete].guid);
      if (success) {
        const deletedItem: LedgerDataItem = ledgerData.items[itemToDelete];
        const message = getMessage(MessageType.ITEM_DELETED, deletedItem);
        Toaster.show({
          message,
          intent: Intent.SUCCESS,
          icon: 'tick-circle',
        });
        setItemToDelete(undefined);
        await reloadLedgerData();
      }
    }
  };

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  };

  const addItem = async (newEntry: PartialLedgerDataItem) => {
    try {
      await createEntry(budgetGuid, newEntry);
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_ADDED, newEntry),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    } catch (err) {
      Toaster.show({
        message: `An error occurred while trying to save the new item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  const editItem = async (editedItem: PartialLedgerDataItem) => {
    try {
      const savedItem = await updateEntry(budgetGuid, editedItem);
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_EDITED, savedItem),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    } catch (err) {
      Toaster.show({
        message: `An error occurred while trying to save the new item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  const copyItems = async (fromYear: number, toYear: number) => {
    try {
      const isCopySuccessful = await copyBudget(budgetGuid, fromYear, toYear);
      if (isCopySuccessful) {
        Toaster.show({
          message: `Successfully copied items from ${fromYear} to ${toYear}`,
          intent: Intent.SUCCESS,
          icon: 'tick-circle',
        });
        setBudgetYear(toYear);
        history.push(`${APP.ROUTES.LEDGER}/${toYear}`);
      }
    } catch (err) {
      console.log(err);
      Toaster.show({
        message: `An error occurred while trying to copy items from ${fromYear} to ${toYear}`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  return (
    <div className={classes.ledger}>
      <div className={classes.ledgerLeft}>
        <LedgerNav scrollToMonth={scrollToMonth} />
      </div>
      <div className={classes.ledgerRight}>
        <Table
          confirmDeletion={confirmDeletion}
          addItem={addItem}
          editItem={editItem}
          copyItems={copyItems}
          scrollToMonth={scrollToMonth}
          isLoading={isLoading}
        />
      </div>
      <Dialog
        isOpen={isDeleteDialogOpen && !!itemToDelete}
        title="Confirm deletion"
        onClose={closeDeleteDialog}
        message={dialogMessage}
        cancelLabel="Cancel"
        cancelIntent={Intent.NONE}
        onCancel={closeDeleteDialog}
        actionLabel="Delete"
        actionIntent={Intent.DANGER}
        actionIcon="trash"
        onAction={async () => await deleteItem()}
      />
    </div>
  );
};
