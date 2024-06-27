import { Dispatch, SetStateAction, useState } from 'react';
import { Button, MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { Category, LedgerDataItem, Subcategory } from '../types';
import { useStyles } from './Categories.styles';
import { useBudgetContext } from '../context';

interface Props {
  itemToCategorize?: LedgerDataItem;
  setCategoryToCreate: Dispatch<SetStateAction<Category | undefined>>;
  setSubcategoryToCreate: Dispatch<SetStateAction<Subcategory | undefined>>;
}

const Categories = (props: Props) => {
  const classes = useStyles();
  const { categories, subcategories } = useBudgetContext();
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(
    categories?.find((element) => element.guid === props.itemToCategorize?.category_guid) ||
      categories[0],
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | undefined>(
    subcategories?.find((element) => element.guid === props.itemToCategorize?.subcategory_guid) ||
      subcategories[0],
  );

  const createCategory = (label: string): Category => {
    const newCategory = {
      label,
      guid: '_new',
    };
    return newCategory;
  };

  function renderCreateCategoryOption(
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>,
  ) {
    return (
      <MenuItem
        icon="add"
        text={`Create "${query}"`}
        roleStructure="listoption"
        active={active}
        onClick={handleClick}
        shouldDismissPopover={false}
      />
    );
  }

  const createSubcategory = (label: string): Subcategory => {
    const newSubcategory = {
      label,
      category_guid: selectedCategory?.guid || null,
      guid: '_new',
    };
    return newSubcategory;
  };

  function renderCreateSubcategoryOption(
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>,
  ) {
    return (
      <MenuItem
        icon="add"
        text={`Create "${query}"`}
        roleStructure="listoption"
        active={active}
        onClick={handleClick}
        shouldDismissPopover={false}
      />
    );
  }

  const saveItemCategory = (category: Category) => {
    if (props.itemToCategorize) {
      props.itemToCategorize.category_guid = category.guid || undefined;
    }
    if (category.guid === '_new') {
      props.setCategoryToCreate(category);
    }
    setSelectedCategory(category);
  };

  const saveItemSubcategory = (subcategory: Subcategory) => {
    if (props.itemToCategorize) {
      props.itemToCategorize.subcategory_guid = subcategory.guid || undefined;
    }
    if (subcategory.guid === '_new') {
      props.setSubcategoryToCreate(subcategory);
    }
    setSelectedSubcategory(subcategory);
  };

  const renderCategory: ItemRenderer<Category | Subcategory> = (
    category: Category | Subcategory,
    { handleClick, handleFocus, modifiers, query },
  ) => {
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={category.guid}
        roleStructure="listoption"
        onClick={handleClick}
        onFocus={handleFocus}
        text={category.label}
      />
    );
  };

  const filterCategory: ItemPredicate<Category | Subcategory> = (
    query,
    category,
    _index,
    exactMatch,
  ) => {
    const normalizedTitle = category.label.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
      return normalizedTitle === normalizedQuery;
    } else {
      return category.label.indexOf(normalizedQuery) >= 0;
    }
  };

  return (
    <div>
      <div>
        Category:{' '}
        <Select2<Category>
          className={classes.select2}
          items={categories}
          itemPredicate={filterCategory}
          itemRenderer={renderCategory}
          onItemSelect={saveItemCategory}
          activeItem={selectedCategory}
          createNewItemFromQuery={createCategory}
          createNewItemRenderer={renderCreateCategoryOption}
        >
          <Button
            text={selectedCategory?.label}
            rightIcon="double-caret-vertical"
            placeholder="Select a category"
          />
        </Select2>
      </div>
      <div>
        Subcategory:{' '}
        <Select2<Subcategory>
          className={classes.select2}
          items={subcategories}
          itemPredicate={filterCategory}
          itemRenderer={renderCategory}
          onItemSelect={saveItemSubcategory}
          activeItem={selectedSubcategory}
          createNewItemFromQuery={createSubcategory}
          createNewItemRenderer={renderCreateSubcategoryOption}
        >
          <Button
            text={selectedSubcategory?.label}
            rightIcon="double-caret-vertical"
            placeholder="Select a subcategory"
          />
        </Select2>
      </div>
    </div>
  );
};

export default Categories;
