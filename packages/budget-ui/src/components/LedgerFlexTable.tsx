import { createRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HotkeysProvider, Intent } from '@blueprintjs/core';
import {
  Cell,
  Column,
  ColumnHeaderCell2,
  Region,
  RenderMode,
  SelectionModes,
  Table2,
  TableLoadingOption,
} from '@blueprintjs/table';
import { useStyles } from './Ledger.styles';
import { parseDate } from '../utils/date';
import { dollarFormat, getMonthAsName } from '../utils/format';
import { useBudgetContext } from '../context';
import { BudgetAuthResponse, LedgerData, LedgerDataItem, MessageType, PartialLedgerDataItem } from '../types';
import { LedgerNav } from './LedgerNav';
import { getMessage, getRegions, updateItemBalances } from '../utils/ledger';
import { createEntry, deleteEntry, getBudgetGuid, getBudgetItems, updateEntry } from '../utils/api';
import { Dialog } from './Dialog';
import { Toaster } from './Toaster';
import { IFocusedCellCoordinates } from '@blueprintjs/table/lib/esm/common/cellTypes';
import { Table } from './Table';

export const LedgerFlexTable = (props: any) => {
  const classes = useStyles();
  const { budgetGuid, setBudgetGuid, budgetYear, ledgerData, setLedgerData } = useBudgetContext();
  let filteredLedgerData: LedgerData = Object.assign({}, ledgerData);
  const currentDate = new Date();
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);

  const [isFirstRenderedYear, setIsFirstRenderedYear] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<number>();
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [isBudgetLoading, setIsBudgetLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ledgerRightWidth, setLedgerRightWidth] = useState(0);

  const [isAdding, setIsAdding] = useState(false);
  const [newSettledDate, setNewSettledDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [newTypeId, setNewTypeId] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>();
  const [newPaid, setNewPaid] = useState<boolean>(false);
  const [newLabel, setNewLabel] = useState<string>('');

  const [itemToEdit, setItemToEdit] = useState<number>();
  const [editedSettledDate, setEditedSettledDate] = useState<string>();
  const [editedTypeId, setEditedTypeId] = useState<number>();
  const [editedAmount, setEditedAmount] = useState<number>();
  const [editedPaid, setEditedPaid] = useState<boolean>();
  const [editedLabel, setEditedLabel] = useState<string>();

  let ledgerRightInstance = createRef<HTMLDivElement>();
  let tableInstance: Table2;
  let regions: React.MutableRefObject<Array<Region>> = useRef<Array<Region>>([]);

  useEffect(() => {
    async function checkBudgetGuid() {
      if (!budgetGuid) {
        const budgetAuthResponse: BudgetAuthResponse = await getBudgetGuid();
        setBudgetGuid(budgetAuthResponse.budgetGUID);
      }
    }
    checkBudgetGuid();
  });

  const reloadLedgerData = useCallback(async () => {
    setItemToEdit(undefined);
    const newLedgerData = await getBudgetItems(budgetGuid, String(budgetYear));
    newLedgerData.items = updateItemBalances(newLedgerData);
    setLedgerData(newLedgerData);
  }, [budgetGuid, budgetYear, setLedgerData]);

  useEffect(() => {
    if (budgetGuid) {
      setIsBudgetLoading(true);
      reloadLedgerData();
      setIsBudgetLoading(false);
      window.document.title = `${budgetYear} Budget`;
    }
  }, [budgetGuid, budgetYear, reloadLedgerData, setLedgerData]);

  useEffect(() => {
    filteredLedgerData.items = ledgerData.items.filter((item) => {
      return (
        searchTerm.trim() === '' || item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    regions.current = getRegions(filteredLedgerData.items);
  }, [ledgerData.items, searchTerm]);

  useEffect(() => {
    if (regions.current.length) {
      try {
        if (isFirstRenderedYear && budgetYear === currentDate.getFullYear()) {
          // scrollToMonth(currentDate.getMonth());
          setIsFirstRenderedYear(false);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, [ledgerData]);

  const scrollTo = (event: React.MouseEvent<HTMLElement, MouseEvent>, target: string) => {
    event.preventDefault();
    console.log(target);
    const el = document.getElementById(target);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    } else {
      console.log('Cannot find target.', target);
    }
  }

  const confirmDeletion = (index: number) => {
    clearItemToEdit();
    setItemToDelete(index);
    setDialogMessage(getMessage(MessageType.CONFIRM_DELETE, ledgerData.items[index]));
    openDeleteDialog();
  };

  const deleteItem = async () => {
    setIsDeleteDialogOpen(false);
    if (itemToDelete) {
      await deleteEntry(budgetGuid, ledgerData.items[itemToDelete].guid);
      const deletedItem: LedgerDataItem = ledgerData.items.splice(itemToDelete, 1)[0];
      await reloadLedgerData();
      const message = getMessage(MessageType.ITEM_DELETED, deletedItem);
      Toaster.show({
        message,
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    }
    setItemToDelete(undefined);
  };

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  };

  const addItem = async (newEntry: PartialLedgerDataItem) => {
    try {
      const addedEntry = await createEntry(budgetGuid, newEntry);
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_ADDED, addedEntry),
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

  const clearAddItem = () => {
    clearItemToEdit();
    setIsAdding(!isAdding);
    setNewSettledDate(defaultDate.toISOString().split('T')[0]);
    setNewTypeId(2);
    setNewAmount(undefined);
    setNewPaid(false);
    setNewLabel('');
  };

  const saveEditedItem = async (guid: string) => {
    try {
      const editedEntry = await updateEntry(budgetGuid, {
        guid,
        settledDate: editedSettledDate?.split('T')[0],
        type_id: editedTypeId,
        amount: editedAmount, 
        paid: !!editedPaid,
        label: editedLabel,
      });
      await reloadLedgerData();
      Toaster.show({
        message: getMessage(MessageType.ITEM_EDITED, editedEntry),
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

  const clearItemToEdit = () => {
    setItemToEdit(undefined);
  };

  return (
    <div className={classes.ledger}>
      <div className={classes.ledgerLeft}>
        <LedgerNav scrollToMonth={scrollTo} />
      </div>
      <div className={classes.ledgerRight} ref={ledgerRightInstance}>
        <Table
          ledgerData={filteredLedgerData}
          confirmDeletion={confirmDeletion}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          addItem={addItem}
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
