import { useCallback, useEffect, useState } from 'react';
import { Intent } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { useStyles } from './Ledger.styles';
import { useBudgetContext } from '../context';
import {
  BudgetAuthResponse,
  Category,
  LedgerDataItem,
  MessageType,
  PartialLedgerDataItem,
  Subcategory,
} from '../types';
import { LedgerNav } from './LedgerNav';
import {
  addLedgerDataItem,
  deleteLedgerDataItem,
  getMessage,
  updateItemBalances,
  updateItemCategories,
  updateLedgerDataItem,
} from '../utils/ledger';
import {
  copyBudget,
  createCategoryRecord,
  createEntry,
  createSubcategoryRecord,
  deleteEntry,
  getBudgetCategories,
  getBudgetGuid,
  getBudgetItems,
  getBudgetSubcategories,
  updateEntry,
} from '../utils/api';
import { Dialog } from './Dialog';
import { Toaster } from './Toaster';
import { Table } from './Table';
import { APP } from '../constants/app';
import Categories from './Categories';

export const Ledger = () => {
  const classes = useStyles();
  const history = useHistory();
  const {
    budgetGuid,
    setBudgetGuid,
    budgetYear,
    setBudgetYear,
    ledgerData,
    setLedgerData,
    categories,
    setCategories,
    subcategories,
    setSubcategories,
  } = useBudgetContext();
  const defaultDate = new Date();
  defaultDate.setFullYear(budgetYear);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryToCreate, setCategoryToCreate] = useState<Category>();
  const [subcategoryToCreate, setSubcategoryToCreate] = useState<Subcategory>();
  const [itemToCategorize, setItemToCategorize] = useState<LedgerDataItem>();
  const [itemToDelete, setItemToDelete] = useState<LedgerDataItem>();
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [isCategorizeDialogOpen, setIsCategorizeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function checkBudgetGuid() {
      if (!budgetGuid) {
        const budgetAuthResponse: BudgetAuthResponse = await getBudgetGuid();
        setBudgetGuid(budgetAuthResponse.budgetGuid);
        const categories: Array<Category> = await getBudgetCategories(
          budgetAuthResponse.budgetGuid,
        );

        setCategories(categories);
        const subcategories: Array<Subcategory> = await getBudgetSubcategories(
          budgetAuthResponse.budgetGuid,
        );

        setSubcategories(subcategories);
      }
    }
    checkBudgetGuid();
  });

  const reloadLedgerData = useCallback(async () => {
    setIsLoading(true);
    setLedgerData({ items: [] });
    const newLedgerData = await getBudgetItems(budgetGuid, String(budgetYear));
    newLedgerData.items = updateItemBalances(newLedgerData);
    newLedgerData.items = updateItemCategories(newLedgerData, categories, subcategories);
    console.log(newLedgerData);
    setLedgerData(newLedgerData);
    setIsLoading(false);
  }, [budgetGuid, budgetYear, setLedgerData]);

  useEffect(() => {
    if (budgetGuid) {
      reloadLedgerData();
      window.document.title = `${budgetYear} Budget`;
    }
  }, [budgetGuid, budgetYear, reloadLedgerData, setLedgerData]);

  const scrollToMonth = (
    target: string,
    event?: React.MouseEvent<HTMLElement, MouseEvent>,
  ): boolean => {
    event?.preventDefault();
    const el = document.getElementById(target);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      return true;
    } else {
      return false;
    }
  };

  const categorize = (event: React.MouseEvent<HTMLElement, MouseEvent>, item: LedgerDataItem) => {
    event.preventDefault();
    setItemToCategorize(item);
    setDialogMessage(getMessage(MessageType.CONFIRM_CATEGORIZATION, item));
    openCategorizeDialog();
  };

  const categorizeItem = async (
    categorizedItem?: PartialLedgerDataItem,
    originalItem?: LedgerDataItem,
  ) => {
    setIsCategorizeDialogOpen(false);
    try {
      if (itemToCategorize) {
        if (categoryToCreate) {
          const newCategory = await createCategoryRecord(budgetGuid, categoryToCreate);
          itemToCategorize.category_guid = newCategory.guid;
          categories.push(newCategory);
          setCategories(categories);
          setCategoryToCreate(undefined);
        }
        if (subcategoryToCreate) {
          const newSubcategory = await createSubcategoryRecord(
            budgetGuid,
            subcategoryToCreate,
            itemToCategorize.category_guid!,
          );
          itemToCategorize.subcategory_guid = newSubcategory.guid;
          subcategories.push(newSubcategory);
          setSubcategories(subcategories);
          setSubcategoryToCreate(undefined);
        }
        setLedgerData(updateLedgerDataItem(ledgerData, itemToCategorize!));
        await updateEntry(budgetGuid, itemToCategorize);
        Toaster.show({
          message: getMessage(MessageType.ITEM_CATEGORIZED, itemToCategorize!),
          intent: Intent.SUCCESS,
          icon: 'tick-circle',
        });
      }
    } catch (err) {
      // originalItem && updateLedgerDataItem(ledgerData, originalItem);
      Toaster.show({
        message: `An error occurred while trying to categorize the item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
    }
  };

  const openCategorizeDialog = () => setIsCategorizeDialogOpen(true);

  const closeCategorizeDialog = () => {
    setIsCategorizeDialogOpen(false);
    setItemToDelete(undefined);
  };

  const confirmDeletion = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    item: LedgerDataItem,
  ) => {
    event.preventDefault();
    setItemToDelete(item);
    setDialogMessage(getMessage(MessageType.CONFIRM_DELETE, item));
    openDeleteDialog();
  };

  const deleteItem = async () => {
    setIsDeleteDialogOpen(false);
    if (itemToDelete) {
      setLedgerData(deleteLedgerDataItem(ledgerData, itemToDelete));
      const success = await deleteEntry(budgetGuid, itemToDelete.guid);
      if (success) {
        const deletedItem: LedgerDataItem = itemToDelete;
        const message = getMessage(MessageType.ITEM_DELETED, deletedItem);
        Toaster.show({
          message,
          intent: Intent.SUCCESS,
          icon: 'tick-circle',
        });
        setItemToDelete(undefined);
      } else {
        setLedgerData(ledgerData);
      }
    }
  };

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  };

  const addItem = async (newItem: PartialLedgerDataItem): Promise<boolean> => {
    try {
      const addedItem = await createEntry(budgetGuid, newItem);
      setLedgerData(addLedgerDataItem(ledgerData, addedItem));
      Toaster.show({
        message: getMessage(MessageType.ITEM_ADDED, addedItem),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
      return true;
    } catch (err) {
      Toaster.show({
        message: `An error occurred while trying to save the new item`,
        intent: Intent.DANGER,
        icon: 'error',
      });
      return false;
    }
  };

  const editItem = async (editedItem: PartialLedgerDataItem, originalItem?: LedgerDataItem) => {
    try {
      setLedgerData(updateLedgerDataItem(ledgerData, editedItem));
      const savedItem = await updateEntry(budgetGuid, editedItem);
      Toaster.show({
        message: getMessage(MessageType.ITEM_EDITED, savedItem),
        intent: Intent.SUCCESS,
        icon: 'tick-circle',
      });
    } catch (err) {
      originalItem && updateLedgerDataItem(ledgerData, originalItem);
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
          categorize={categorize}
          confirmDeletion={confirmDeletion}
          addItem={addItem}
          editItem={editItem}
          copyItems={copyItems}
          scrollToMonth={scrollToMonth}
          isLoading={isLoading}
        />
      </div>
      <Dialog
        isOpen={isCategorizeDialogOpen && !!itemToCategorize}
        title="Assign Categories"
        onClose={closeCategorizeDialog}
        message={dialogMessage}
        cancelLabel="Cancel"
        cancelIntent={Intent.NONE}
        onCancel={closeCategorizeDialog}
        actionLabel="Save"
        actionIntent={Intent.PRIMARY}
        actionIcon="saved"
        onAction={async () => await categorizeItem()}
      >
        <Categories
          itemToCategorize={itemToCategorize}
          setCategoryToCreate={setCategoryToCreate}
          setSubcategoryToCreate={setSubcategoryToCreate}
        />
      </Dialog>
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
