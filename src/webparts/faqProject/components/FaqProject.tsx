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
} from "office-ui-fabric-react";
import * as React from "react";
import { CategoryProvider, ICategoryProvider } from "../../../providers/CategoryProvider";
import { FAQProvider, IFAQProvider } from "../../../providers/FAQProvider";
import {
  ISharePointProvider,
  SharePointProvider,
} from "../../../providers/SharePointProvider";
import { Category } from "../../models/Category";
import { FAQ } from "../../models/FAQ";
import FaqCollapsible from "./FaqCollapsibleSolution/FaqCollapsible";
import FaqPanelSolution from "./FaqPanelSolution/FaqPanelSolution";
import styles from "./FaqProject.module.scss";
import Fuse from 'fuse.js'
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";


export interface IFaqProjectProps {
  //PropertyPanes
  description?: string;
  context: WebPartContext;
  categoryListId: string;
  faqListId: string;
  panelViewToggle: boolean;
  //PropertyPanes
}

const FaqProject = ({
  description,
  context,
  categoryListId,
  faqListId,
  panelViewToggle,
}: IFaqProjectProps) => {
  const sharePointProvider: ISharePointProvider = new SharePointProvider(
    context
  );

  const categoryProvider: ICategoryProvider = new CategoryProvider(
    context,
    categoryListId
  );

  const faqProvider: IFAQProvider = new FAQProvider(context, faqListId);

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [questions, setQuestions] = React.useState<FAQ[]>([]);
  const [questionsFiltered, setQuestionsFiltered] = React.useState<FAQ[]>([]);
  const [question, setQuestion] = React.useState<FAQ>(faqProvider.generateEmptyFAQ());
  const [updatePanelIsOpen, setUpdatePanelIsOpen] = React.useState<boolean>(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = React.useState<boolean>(false);
  const [deletedFAQ, setDeletedFAQ] = React.useState<FAQ>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isCalloutVisible, setIsCalloutVisible] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(context.pageContext.web.permissions.hasAllPermissions());
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const [searchStr, setSearchStr] = React.useState<string>("");
  const [searchCatIDs, setSearchCatIDs] = React.useState<number[]>([]);
  // const [searchCatIDs, setSearchCatIDs] = React.useState({searchCatIDs: [], username: () => filterFAQ()});
//   const [allValues, setAllValues] = React.useState({
//     mobile: [],
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//  });


  const onPanelDismiss = () => {
    setUpdatePanelIsOpen((prev) => (prev = false));
    setQuestion((prev) => faqProvider.generateEmptyFAQ());
    console.log(faqProvider);
  };

  const onUpdateFAQ = (faq: FAQ) => {
    setUpdatePanelIsOpen((prev) => (prev = true));
    setQuestion((prev) => (prev = faq));
  };


  React.useEffect(() => {
    getData();
  }, []);

  if (!faqListId || faqListId == "" || !categoryListId || categoryListId == "")
    return <Text>You have to pick a list from your property pane!!!</Text>;

  return (
    <div>
      {console.log(JSON.stringify(faqProvider) + "kofwekofkeowekfkekgeorkgkokok")}
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
              {categories.map((category, index) => {
                return (
                  <Checkbox
                    label={category.Title}
                    title={category.Title}
                    checked={searchCatIDs.indexOf(category.ID) >= 0}
                    onChange={(ev, checked) =>
                      {let newCategories = setfilterCategories(category, checked)
                      setSearchCatIDs(newCategories)
                      } 
                    } 

                    key={`CategoryID${category.ID}`}
                  />
                );
              })}
            </Stack>
          </Callout>
        )}
      </Stack>
      <Panel
        customWidth="415px"
        type={PanelType.custom}
        headerText={question.ID ? "Update" : "Create"}
        isLightDismiss
        isOpen={updatePanelIsOpen}
        onDismiss={() => onPanelDismiss()}
      >
        <TextField
          value={question.Question}
          required={true}
          onChange={(ev, value) => updateQuestion({ Question: value })}
          onGetErrorMessage={() => getErrorMessage(question.Question)}
          label={"Question"}
          multiline
          rows={3}
        />
        <RichText
          value={question.Answer}
          onChange={(newValue) => {
            updateQuestion({ Answer: newValue });
            return newValue;
          }}
          placeholder="TESTING"
        />

        <ComboBox
          required={true}
          selectedKey={question.FAQ_CategoryId}
          label="Please pick a category"
          placeholder="Select a category/categories"
          multiSelect
          options={categories.map((cat): IComboBoxOption => {
            return { key: cat.ID, text: cat.Title };
          })}
          onChange={(event, option) => updateQuestionCategory(option)}
          style={{ maxWidth: "300" }}
        />
        <DialogFooter>
          <PrimaryButton
            disabled={comboBoxValidation(question)}
            onClick={(event) => saveQuestion(event)}
          >
            {question.ID ? "Update" : "Create"}
          </PrimaryButton>
          <DefaultButton
            style={{ margin: "5px" }}
            onClick={() => setUpdatePanelIsOpen(false)}
            text="Cancel"
          />
        </DialogFooter>
      </Panel>
      {panelViewToggle && (
        <FaqPanelSolution
          isAdmin={isAdmin}
          updateFAQ={(FAQtoUpdate) => onUpdateFAQ(FAQtoUpdate)}
          deleteFAQ={(deletedFAQ: FAQ) => _onDeleteFAQ(deletedFAQ)}
          questions={questionsFiltered}
        />
      )}
      {!panelViewToggle && (
        <FaqCollapsible
          isAdmin={isAdmin}
          deleteFAQ={(deletedFAQ: FAQ) => _onDeleteFAQ(deletedFAQ)}
          updateFAQ={(FAQtoUpdate) => onUpdateFAQ(FAQtoUpdate)}
          questions={questionsFiltered}
        />
      )}
    </div>
  );

  async function getData(): Promise<void> {
    let data: FAQ[] = await faqProvider.getFAQ();
    let categories: Category[] = await categoryProvider.getCategory();

    setQuestions(data);
    setQuestionsFiltered(data);
    setCategories(categories);
  }

  function updateQuestion(updates: Partial<FAQ>): string {
    setQuestion({ ...question, ...updates });
    return "";
  }

  function updateQuestionCategory(categoryOption: IComboBoxOption): void {
    let catIDs: number[] = clone(question.FAQ_CategoryId);

    if (categoryOption.selected) {
      catIDs.push(categoryOption.key as number);
    } else {
      catIDs.splice(catIDs.indexOf(categoryOption.key as number), 1);
    }

    updateQuestion({ FAQ_CategoryId: catIDs });
  }

  async function saveQuestion(event: any): Promise<void> {
    await faqProvider.createUpdateFaq(question);

    setUpdatePanelIsOpen(false);
    setQuestion(faqProvider.generateEmptyFAQ());

    getData();
  }

  async function deleteQuestion(): Promise<void> {
    setIsDeleting(true);

    await faqProvider.deleteFAQ(deletedFAQ);
    await getData();

    setDeleteDialogIsOpen(false);
    setDeletedFAQ(null);
  }

  function _onDeleteFAQ(faqToDelete: FAQ): void {
    setDeleteDialogIsOpen(true);
    setDeletedFAQ(faqToDelete);
    setIsDeleting(false);
  }

  // FUSESEARCH
  function fuseSearch() {
    console.log("Hello World0");

    if (searchStr == "" && searchCatIDs.length == 0) {
      setQuestionsFiltered(questions);
    } else {
      const fuse = new Fuse(questions, {
        keys: [
          "Question",
          "Answer",
          {
            name: "Categories",
            getFn: (item: FAQ) =>
              item.FAQ_Category.map((category) => category.Title).join(" "),
          },
        ],
      });

      let results = fuse.search(searchStr);

      console.log(results);
      setQuestionsFiltered(results.map((x) => x.item));

      let questionsClone = cloneDeep(questions);
    }
  }

  function searchFAQ(searchterm: string) {
    console.log("Hello World1");

    setSearchStr(searchterm)
    fuseSearch();

  }

  function filterFAQ() {
    console.log("Hello World2");
    if (searchStr == "" && searchCatIDs.length == 0) {
      setQuestionsFiltered(questions);
    } else {
      let questionsClone = cloneDeep(questions);

      if (searchStr != "") {
        questionsClone = questionsClone.filter((element) => {
          if (
            element.Question.toLocaleLowerCase().indexOf(
              searchStr.toLocaleLowerCase()
            ) > -1 ||
            element.Answer.toLocaleLowerCase().includes(
              searchStr.toLocaleLowerCase()
            )
          ) {
            return element;
          }
        });
      }

      if (searchCatIDs.length > 0) {
        questionsClone = questionsClone.filter((element) => {
          if (
            searchCatIDs.every(
              (value) => element.FAQ_CategoryId.indexOf(value) >= 0
            )
          ) {
            return element;
          }
        });
      }
      setQuestionsFiltered(questionsClone);
    }
  }

  function setfilterCategories (category: Category, isChecked: boolean): number[] {
    let catIDs: number[] = [...searchCatIDs];
    if (isChecked) {
      catIDs.push(category.ID);
    } else { 
      catIDs.splice(catIDs.indexOf(category.ID), 1);
    }

    return catIDs;
    // setSearchCatIDs((prev) =>{ return filterFAQ(), prev = catIDs} )
    // this.setState({ searchCatIDs: catIDs }, () => { this.filterFAQ() });
  }

  function getErrorMessage(value: string): string {
    return value.length > 5 ? "" : `Input value length must be more than [ 5 ] characters. Actual length is: ${value.length} characters.`;
  }

  function comboBoxValidation(question: FAQ): boolean {
    // if (question.FAQ_CategoryId.length == 0 || question.Question.length < 6 || question.Answer.length < 6) {
    //   return true;
    // } else {
    //   return false;
    // }
    return false;
  }
};



export default FaqProject


