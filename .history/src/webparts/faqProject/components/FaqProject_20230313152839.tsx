import { clone, cloneDeep, keys } from "@microsoft/sp-lodash-subset";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  ActionButton,
  Callout,
  Checkbox,
  ComboBox,
  IComboBoxOption,
  SelectableOptionMenuItemType,
  CommandBarButton,
  CommandButton,
  DefaultButton,
  Dialog,
  DialogFooter,
  IconButton,
  Label,
  NormalPeoplePicker,
  Panel,
  PrimaryButton,
  SearchBox,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
  TextField,
  Toggle,
  PanelType,
  arraysEqual,
  IPersonaProps,
  IGroup,
} from "office-ui-fabric-react";
import * as React from "react";
import { CategoryProvider, ICategoryProvider } from "../../../providers/CategoryProvider";
import { FAQProvider, IFAQProvider } from "../../../providers/FAQProvider";
import { ISubCategoryProvider, SubCategoryProvider } from "../../../providers/SubCategoryProvider";

import { Category } from "../../models/Category";
import { IFAQ } from "../../models/IFAQ";
import FaqCollapsible from "./FaqCollapsibleSolution/FaqCollapsible";
import FaqPanelSolution from "./FaqPanelSolution/FaqPanelSolution";
import styles from "./FaqProject.module.scss";
import Fuse from 'fuse.js'
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { SubCategory } from "../../models/SubCategory";
import { IPropertyFieldGroupOrPerson } from "@pnp/spfx-property-controls";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { TargetGroup } from "../../models/TargetGroup";
import { IAdGroup } from "../../models/IAdGroup";


export interface IFaqProjectProps {
  //PropertyPanes
  description?: string;
  context: WebPartContext;
  categoryListId: string;
  subCategoryListId: string;
  faqListId: string;
  panelViewToggle: boolean;
  people: IPropertyFieldGroupOrPerson[];
  targetingData: TargetGroup[];
  //PropertyPanes
}

const FaqProject = ({ description, context, categoryListId, subCategoryListId, faqListId, panelViewToggle, targetingData }: IFaqProjectProps) => {

  const categoryProvider: ICategoryProvider = new CategoryProvider(context, categoryListId);
  const subCategoryProvider: ISubCategoryProvider = new SubCategoryProvider(context, subCategoryListId)
  const faqProvider: IFAQProvider = new FAQProvider(context, faqListId);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subCategories, setSubCategories] = React.useState<SubCategory[]>([]);
  const [questions, setQuestions] = React.useState<IFAQ[]>([]);
  const [questionsFiltered, setQuestionsFiltered] = React.useState<IFAQ[]>([]);
  const [question, setQuestion] = React.useState<IFAQ>(faqProvider.generateEmptyFAQ());
  const [updatePanelIsOpen, setUpdatePanelIsOpen] = React.useState<boolean>(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = React.useState<boolean>(false);
  const [deletedFAQ, setDeletedFAQ] = React.useState<IFAQ>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isCalloutVisible, setIsCalloutVisible] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(context.pageContext.web.permissions.hasAllPermissions());
  const [searchStr, setSearchStr] = React.useState<string>("");
  const [searchCatIDs, setSearchCatIDs] = React.useState<string[]>([]);
  const [categorySelected, setCategorySelected] = React.useState<boolean>(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = React.useState<IComboBoxOption[]>([]);

    
  const options: () => IComboBoxOption[] = () => {
    let rows: IComboBoxOption[] = [];
    const SelectedMainCatagories = categories.filter(x => question.FAQ_CategoryId.some(selectedCat => x.ID == selectedCat)).sort();
    for(let mainCat of SelectedMainCatagories){
      rows.push({key: `Main_${mainCat.ID}`, text: mainCat.Title, itemType: SelectableOptionMenuItemType.Header});
      const PossibleSubCatagories = subCategories.filter(x => x.Main_CategoryId == mainCat.ID).sort();
      for(let subCat of PossibleSubCatagories)
        rows.push({key: subCat.ID, text: subCat.Title});
    }

    return rows;
  }

  const onPanelDismiss = () => {
    setUpdatePanelIsOpen((prev) => (prev = false));
    setQuestion((prev) => faqProvider.generateEmptyFAQ());
    setCategorySelected(false);
  };

  const onUpdateFAQ = (faq: IFAQ) => {
    setUpdatePanelIsOpen((prev) => (prev = true));
    setQuestion((prev) => (prev = faq));
    loadSubCategoriesOnselected(true);
  };


  React.useEffect(() => {
    getData().catch((error) => console.log("error"));
  }, []);

  if (!faqListId || faqListId == "" || !categoryListId || categoryListId == "")
    return <Text>You have to pick a list from your property pane!!!</Text>;

    

  const filteredQuestions = questions.filter((faq: IFAQ) => filterForQuestions(faq, searchStr, searchCatIDs));
  return (
    <div>
      <p style={{ color: "red" }}>IDs selected: {question.FAQ_CategoryId}</p>
      <Dialog
        closeButtonAriaLabel="close"
        title={"Delete the question?"}
        subText={"Are you sure you want to delete the question?"}
        isOpen={deleteDialogIsOpen}
        onDismiss={() => setDeleteDialogIsOpen(false)}
      >
        <DialogFooter>
          {isDeleting && (
            <Spinner
              label="Deleting FAQ..."
              ariaLive="assertive"
              labelPosition="right"
              size={SpinnerSize.large}
            />
          )}
          {!isDeleting && (
            <div className={styles.deleteBtnContainer}>
              <PrimaryButton
                style={{ margin: "5px" }}
                onClick={() => deleteQuestion()}
                text="Delete"
              />
              <DefaultButton
                style={{ margin: "5px" }}
                onClick={() => setDeleteDialogIsOpen(false)}
                text="Cancel"
              />
            </div>
          )}
        </DialogFooter>
      </Dialog>


      <Stack style={{ marginBottom: "-17px" }} horizontal>
        {/* SEARCH */}
        <TextField
          placeholder="Search"
          iconProps={{ iconName: "Search" }}
          type="text"
          value={searchStr}
          onChange={(event, newValue) => searchFAQ(newValue)}
        />
        {/* SEARCH */}

        <IconButton
          id="buttonid"
          onClick={(e) => setIsCalloutVisible(true)}
          text="Filter"
          iconProps={{ iconName: "Filter" }}
        />
        <Stack horizontal tokens={{ childrenGap: "10px" }}>
          {isAdmin && (
            <CommandBarButton
              style={{ marginTop: "0px", height: "30px" }}
              iconProps={{ iconName: "Add" }}
              onClick={() => setUpdatePanelIsOpen(true)}
              text="Add Question"
            />
          )}
        </Stack>
        {isCalloutVisible && (
          <Callout
            className={styles.callout}
            gapSpace={0}
            onDismiss={() => setIsCalloutVisible(false)}
            target={"#buttonid"}
            setInitialFocus
          >
            <Stack
              tokens={{ childrenGap: "10px" }}
              style={{ textAlign: "center" }}
            >
              <Stack tokens={{ childrenGap: "5px" }} >
                <Stack horizontal><strong>Category</strong></Stack>
              </Stack>
              {categories.map((category, index) => {
                return (
                  <Checkbox
                    label={category.Title}
                    title={category.Title}
                    checked={searchCatIDs.find(e => e == category.Title) != null}
                    onChange={(ev, checked) => setfilterCategories(category, checked)}
                    key={`CategoryID${category.ID}`}
                  />
                );
              })}
              <div
                style={{ margin: "15px 0px 5px 0px" }}
                className={styles.bar}
              />

              <Stack tokens={{ childrenGap: "5px" }} >
                <Stack horizontal><strong>Sub-Category</strong></Stack>
              </Stack>
              {subCategories.map((subCategory, index) => {
                return (
                  <Checkbox
                    label={subCategory.Title}
                    title={subCategory.Title}
                    checked={searchCatIDs.find(e => e == subCategory.Title) != null}
                    onChange={(ev, checked) => setfilterCategories(subCategory, checked)}
                    key={`SubCategoryID${subCategory.ID}`}
                  />
                );
              })}
            </Stack>
          </Callout>
        )}
      </Stack>
      {/* PANEL */}
      <Panel
        customWidth="415px"
        type={PanelType.custom}
        headerText={question.ID ? "Update" : "Create"}
        isLightDismiss
        isOpen={updatePanelIsOpen}
        onDismiss={() => onPanelDismiss()}
      >
        <TextField
          style={{ marginBottom: "10px" }}
          value={question.Question}
          required={true}
          onChange={(ev, value) => updateQuestion({ Question: value })}
          onGetErrorMessage={() => getErrorMessage(question.Question)}
          label={"Question"}
          multiline
          rows={3}
          placeholder="Question"
        />
        <RichText
          className={styles.richTextEditor}
          value={question.Answer}
          onChange={(newValue) => {
            updateQuestion({ Answer: newValue });
            return newValue;
          }}
          placeholder="Answer"
        />
      
        <Stack>
          <ComboBox
            required={true}
            selectedKey={question.FAQ_CategoryId}
            label="Select a Category"
            placeholder="Category/Categories"
            multiSelect
            options={categories.map((cat): IComboBoxOption => {
              return { key: cat.ID, text: cat.Title };
            })}
            onChange={(event, option) => updateQuestionCategory(option)}
            style={{ maxWidth: "300" }}
          />
          {categorySelected && (
            <ComboBox
              selectedKey={question.FAQ_SubCategoryId}
              label="Pick a Sub-Sategory"
              placeholder="Sub-Category/Sub-Categories"
              multiSelect
              options={options()}
              onChange={(event, option) => updateSubQuestionCategory(option)}
              style={{ maxWidth: "300" }}
            />
          )} 
            <ComboBox
              required={true}
              selectedKey={selectedTargetGroups.map((value, index) => value.key as string)}
              label="Select Audience Target"
              placeholder="Audience Target... / Group"
              multiSelect
              options={targetingData.map((targetGroup, index) => {
                return { key: index, text: targetGroup.title, data: targetGroup };
              })}
              onChange={(event, option) => updateAudienceTargeting(option)}
              style={{ maxWidth: "300" }}
          />
          
        </Stack>
        <DialogFooter>
          <PrimaryButton
            disabled={isQuestionTextfieldEmpty(question)}
            onClick={() => saveQuestion()}
          >
            {question.ID ? "Update" : "Create"}
          </PrimaryButton>
          <DefaultButton
            style={{ margin: "5px" }}
            onClick={() => onPanelDismiss()}
            text="Cancel"
          />
        </DialogFooter>
      </Panel>
      {panelViewToggle && (
        <FaqPanelSolution
          isAdmin={isAdmin}
          updateFAQ={(FAQtoUpdate) => onUpdateFAQ(FAQtoUpdate)}
          deleteFAQ={(deletedFAQ: IFAQ) => _onDeleteFAQ(deletedFAQ)}
          questions={filteredQuestions}
        />
      )}
      {!panelViewToggle && (
        <FaqCollapsible
          isAdmin={isAdmin}
          deleteFAQ={(deletedFAQ: IFAQ) => _onDeleteFAQ(deletedFAQ)}
          updateFAQ={(FAQtoUpdate) => onUpdateFAQ(FAQtoUpdate)}
          questions={filteredQuestions}
        />
      )}

    </div>
  );


  //------------------CRUD------------------------  
  async function getData(): Promise<void> {
    let data: IFAQ[] = await faqProvider.getFAQ();
    let categories: Category[] = await categoryProvider.getCategory();
    setQuestions(data);
    // setQuestionsFiltered(data);
    setCategories(categories);
  }

  function updateQuestion(updates: Partial<IFAQ>) {
    setQuestion({ ...question, ...updates });
  }

  function updateQuestionCategory(categoryOption: IComboBoxOption): void {
    let catIDs: number[] = clone(question.FAQ_CategoryId);
    if (categoryOption.selected) {
      catIDs.push(categoryOption.key as number);
      loadSubCategoriesOnselected(true);
    }
    else {
      catIDs.splice(catIDs.indexOf(categoryOption.key as number), 1);
      if (catIDs.length == 0) {
        loadSubCategoriesOnselected(false);
      }
    }

    updateQuestion({ FAQ_CategoryId: catIDs });
  }

  function updateAudienceTargeting(targetGroup: IComboBoxOption) {
    let targetGroupArr: IComboBoxOption[] = cloneDeep(selectedTargetGroups);
    if (targetGroup.selected) {
      targetGroupArr.push(targetGroup)
    } else {
      targetGroupArr = targetGroupArr.filter((value, index) => value.key != targetGroup.key)
    }
    setSelectedTargetGroups(targetGroupArr)
  }

  async function loadSubCategoriesOnselected(catSelect: boolean) {
    setCategorySelected(catSelect);
    let subCategories: SubCategory[] = await subCategoryProvider.getSubCategory();
     
    setSubCategories(subCategories);

  }

  function updateSubQuestionCategory(categoryOption: IComboBoxOption): void {
    let subCatIDs: number[] = clone(question.FAQ_SubCategoryId);
    if (categoryOption.selected) {
      subCatIDs.push(categoryOption.key as number);
    } else {
      subCatIDs.splice(subCatIDs.indexOf(categoryOption.key as number), 1);
    }
    updateQuestion({ FAQ_SubCategoryId: subCatIDs });
  }

  async function saveQuestion(): Promise<void> {
    let adGroup: IAdGroup[] = [];
    if (selectedTargetGroups.length > 0) {
      selectedTargetGroups.map((option) => {
        option.data.group.map((group) => {
          adGroup.push({ id: group.id, name: group.text })
        })
      })
      question.Audience_Target = adGroup;
    }
    await faqProvider.createUpdateFaq(question);
    setUpdatePanelIsOpen(false);
    setQuestion(faqProvider.generateEmptyFAQ());
    setCategorySelected(false);
    getData();
  }

  async function deleteQuestion(): Promise<void> {
    setIsDeleting(true);

    await faqProvider.deleteFAQ(deletedFAQ);
    await getData();

    setDeleteDialogIsOpen(false);
    setDeletedFAQ(null);
  }

  function _onDeleteFAQ(faqToDelete: IFAQ): void {
    setDeleteDialogIsOpen(true);
    setDeletedFAQ(faqToDelete);
    setIsDeleting(false);
  }
  //-----------------END-CRUD------------------------


 


  //----FUSESEARCH---
  function fuseSearch() {
    if (searchStr == "" && searchCatIDs.length == 0) {
      setQuestionsFiltered(questions);
    } else {
      const fuse = new Fuse(questions, {
        keys: [
          "Question",
          "Answer",
          {
            name: "Categories",
            getFn: (item: IFAQ) =>
              item.FAQ_Category.map((category) => category.Title).join(" "),
          },
        ],
      });

      let results = fuse.search(searchStr);

      setQuestionsFiltered(results.map((x) => x.item));
      console.log("fuse search")
    }
  }

  function searchFAQ(searchterm: string) {
    setSearchStr(searchterm);
    // fuseSearch();
  }


  // function filterFAQ() {
  //   console.log("Hello World2");
  //   if (searchStr == "" && searchCatIDs.length == 0) {
  //     setQuestionsFiltered(questions);
  //   } else {
  //     let questionsClone = cloneDeep(questions);

  //     if (searchStr != "") {
  //       questionsClone = questionsClone.filter((element) => {
  //         if (
  //           element.Question.toLocaleLowerCase().indexOf(
  //             searchStr.toLocaleLowerCase()
  //           ) > -1 ||
  //           element.Answer.toLocaleLowerCase().includes(
  //             searchStr.toLocaleLowerCase()
  //           )
  //         ) {
  //           return element;
  //         }
  //       });
  //     }

  //   if (searchCatIDs.length > 0) {
  //     questionsClone = questionsClone.filter((element) => {
  //       if (
  //         searchCatIDs.every(
  //           (value) => element.FAQ_CategoryId.indexOf(value) >= 0
  //         )
  //       ) {
  //         return element;
  //       }
  //     });
  //   }
  //   setQuestionsFiltered(questionsClone);
  // }
  // }


  function setfilterCategories(category: Category, isChecked: boolean) {
    let catIDs: string[] = [...searchCatIDs];

    if (isChecked) {
      catIDs.push(category.Title);
    } else {
      catIDs.splice(catIDs.indexOf(category.Title), 1);
    }

    setSearchCatIDs(catIDs);
  }

  function getErrorMessage(value: string): string {
    return value.length > 5 ? "" : `Input value length must be more than [ 5 ] characters. Actual length is: ${value.length} characters.`;
  }

  function isQuestionTextfieldEmpty(question: IFAQ): boolean {
    if (question.FAQ_CategoryId.length == 0 || question.Question.length < 6 || question.Answer.length < 6) {
      return true;
    } else {
      return false;
    }
  }
};

const filterForQuestions = (faq: IFAQ, searchStr: string, selectedCategories: string[]): IFAQ => {
  if (searchStr == "" || faq.Question.includes(searchStr) || faq.Answer.includes(searchStr)) {
    if (selectedCategories != null && selectedCategories.length > 0) {
      if (faq.FAQ_Category != null || faq.FAQ_SubCategory != null)
        if (faq.FAQ_Category.some((e) => selectedCategories.some(c => c == e.Title) || faq.FAQ_SubCategory.some((e) => selectedCategories.some(c => c == e.Title))))
          return faq;
    } else {
      return faq;
    }
  }
}


export default FaqProject


