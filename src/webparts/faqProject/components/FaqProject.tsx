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


export interface IFaqProjectProps {
  //PropertyPanes
  description?: string;
  context: WebPartContext;
  categoryListId: string;
  faqListId: string;
  panelViewToggle: boolean;
  //PropertyPanes
}

export interface IFaqProjectState {
  categories: Category[];
  questions: FAQ[];
  questionsFiltered: FAQ[];
  question: FAQ;
  updatePanelIsOpen: boolean;
  deleteDialogIsOpen: boolean;
  deletedFAQ: FAQ;
  isDeleting: boolean;
  isAdmin: boolean;
  isCalloutVisible: boolean;
  isChecked: boolean;
  searchStr: string;
  searchCatIDs: number[];
}


export default class FaqProject extends React.Component<
  IFaqProjectProps,
  IFaqProjectState
> {
  private SharePointProvider: ISharePointProvider = new SharePointProvider(
    this.props.context
  );

  private CategoryProvider: ICategoryProvider = new CategoryProvider(
    this.props.context,
    this.props.categoryListId
  )

  private FaqProvider: IFAQProvider = new FAQProvider(
    this.props.context,
    this.props.faqListId
  );

  constructor(props: IFaqProjectProps) {
    super(props);
    this.state = {
      categories: [],
      questions: [],
      questionsFiltered: [],
      question: this.FaqProvider.generateEmptyFAQ(),
      updatePanelIsOpen: false,
      isCalloutVisible: false,
      deletedFAQ: null,
      deleteDialogIsOpen: false,
      isDeleting: false,
      isChecked: false,
      isAdmin: this.props.context.pageContext.web.permissions.hasAllPermissions(),
      // isAdmin: false,
      searchStr: "",
      searchCatIDs: []
    };
  }

  private options: IComboBoxOption[] = [{key: 1, text: "Options 1"}]

  componentDidMount(): void {
    this.getData();
  }

  public render(): React.ReactElement<IFaqProjectProps> {

    if (!this.props.faqListId || this.props.faqListId == ""
        || !this.props.categoryListId || this.props.categoryListId == "")
      return <Text>You have to pick a list from your property pane!!!</Text>;
    return (
      <>
        <Dialog
          closeButtonAriaLabel="close"
          title={"Delete the question?"}
          subText={"Are you sure you want to delete this question"}
          isOpen={this.state.deleteDialogIsOpen}
          onDismiss={() => this.setState({ deleteDialogIsOpen: false })}
        >
          <DialogFooter>
            {this.state.isDeleting && (
              <Spinner
                label="Deleting FAQ..."
                ariaLive="assertive"
                labelPosition="right"
                size={SpinnerSize.large}
              />
            )}
            {!this.state.isDeleting && (
              <div className={styles.deleteBtnContainer}>
                <PrimaryButton
                  style={{ margin: "5px" }}
                  onClick={() => this.deleteQuestion()}
                  text="Delete"
                />
                <DefaultButton
                  style={{ margin: "5px" }}
                  onClick={() => this.setState({ deleteDialogIsOpen: false })}
                  text="Cancel"
                />
              </div>
            )}
          </DialogFooter>
        </Dialog>

        <Stack style={{ marginBottom: "-17px" }} horizontal>
          <SearchBox
            placeholder="Search"
            iconProps={{ iconName: "Search" }}
            type="text"
            onChange={(event, newValue) => this.searchFAQ(newValue)}
          />

          <IconButton
            id="buttonid"
            onClick={(e) => this.setState({ isCalloutVisible: true })}
            text="Filter"
            iconProps={{ iconName: "Filter" }}
          />
           <Stack horizontal tokens={{ childrenGap: "10px" }}>
          {this.state.isAdmin && (
            <CommandBarButton
              style={{ marginTop: "0px", height: "30px" }}
              iconProps={{ iconName: "Add" }}
              onClick={() =>
                this.setState({
                  updatePanelIsOpen: true,
                })
              }
              text="Add Question"
            />
          )}
        </Stack>
          {this.state.isCalloutVisible && (
            <Callout
              className={styles.callout}
              gapSpace={0}
              onDismiss={() => this.setState({ isCalloutVisible: false })}
              target={"#buttonid"}
              setInitialFocus
              >
              <Stack tokens={{childrenGap: "10px"}} style={{ textAlign: "center" }}>
                {this.state.categories.map((category, index) => {
                  return (
                    <Checkbox
                      label={category.Title}
                      title={category.Title}
                      checked={this.state.searchCatIDs.indexOf(category.ID) >= 0}
                      onChange={(ev, checked) => this.filterCategory(category, checked)}
                      key={`CategoryID${category.ID}`}
                    />
                  )
                })}
              </Stack>
            </Callout>
          )}
        </Stack>
        <Panel
          headerText={this.state.question.ID ? "Update" : "Create"}
          isLightDismiss
          isOpen={this.state.updatePanelIsOpen}
          onDismiss={() =>
            this.setState({
              updatePanelIsOpen: false,
              question: this.FaqProvider.generateEmptyFAQ(),
            })
          }
        >
          <TextField
            value={this.state.question.Question}
            onChange={(ev, value) => this.updateQuestion({ Question: value })}
            label="Question"
            multiline
            rows={3}
          />
          <TextField
            value={this.state.question.Answer}
            onChange={(ev, value) => this.updateQuestion({ Answer: value })}
            label="Answer"
            multiline
            rows={3}
          />
          
          <ComboBox
            selectedKey={this.state.question.FAQ_CategoryId}
            label="Please pick a category"
            placeholder="Select a category/categories"
            multiSelect            
            options={this.state.categories.map((cat): IComboBoxOption => {return({key: cat.ID, text: cat.Title})})}
            onChange={(event, option) => this.updateQuestionCategory(option)}
            style={{maxWidth: "300"}}
            />
          <DialogFooter>
            <PrimaryButton onClick={() => this.saveQuestion()}>
              {this.state.question.ID ? "Update" : "Create"}
            </PrimaryButton>
          </DialogFooter>
        </Panel>
        {this.props.panelViewToggle && (
          <FaqPanelSolution
            deleteFAQ={(deletedFAQ: FAQ) => this._onDeleteFAQ(deletedFAQ)}
            questions={this.state.questionsFiltered}
          />
        )}
        {!this.props.panelViewToggle && (
          <FaqCollapsible
            isAdmin={this.state.isAdmin}
            deleteFAQ={(deletedFAQ: FAQ) => this._onDeleteFAQ(deletedFAQ)}
            updateFAQ={(FAQtoUpdate) =>
              this.setState({ updatePanelIsOpen: true, question: FAQtoUpdate })
            }
            questions={this.state.questionsFiltered}
          />
        )}
      </>
    );
  }

  private async getData(): Promise<void> {
    let data: FAQ[] = await this.FaqProvider.getFAQ();
    let categories: Category[] = await this.CategoryProvider.getCategory();
    this.setState({ questions: data, questionsFiltered: data, categories: categories });
  }

  private updateQuestion(updates: Partial<FAQ>): void {
    this.setState({
      question: {
        ...this.state.question,
        ...updates,
        
      },
    });
  }
  
  private updateQuestionCategory(categoryOption: IComboBoxOption): void {
    let catIDs: number[] = clone(this.state.question.FAQ_CategoryId);
    
    if (categoryOption.selected) {
      catIDs.push(categoryOption.key as number);
    } else {
      catIDs.splice(catIDs.indexOf(categoryOption.key as number), 1);
    }

    this.updateQuestion({ FAQ_CategoryId: catIDs });
  } 


  private async saveQuestion(): Promise<void> {
    await this.FaqProvider.createUpdateFaq(this.state.question);
    this.setState({
      updatePanelIsOpen: false,
      question: this.FaqProvider.generateEmptyFAQ(),
    });
    this.getData();
  }

  private async deleteQuestion(): Promise<void> {
    this.setState({
      isDeleting: true,
    });
    await this.FaqProvider.deleteFAQ(this.state.deletedFAQ);
    await this.getData();

    this.setState({
      deleteDialogIsOpen: false,
      deletedFAQ: null,
    });
  }

  private _onDeleteFAQ(faqToDelete: FAQ): void {
    this.setState({
      deleteDialogIsOpen: true,
      deletedFAQ: faqToDelete,
      isDeleting: false,
    });
  }

  private searchFAQ(searchterm: string){
    this.setState({
      searchStr: searchterm
    },() => {
      this.filterFAQ()
    });
  }

  private filterFAQ(){
    if (this.state.searchStr == "" && this.state.searchCatIDs.length == 0){
      this.setState({
        questionsFiltered: this.state.questions
      });
    } else {
      let questionsClone = cloneDeep(this.state.questions);

      if (this.state.searchStr != "") {
        questionsClone = questionsClone.filter((element) => {
          if (element.Question.toLocaleLowerCase().indexOf(this.state.searchStr.toLocaleLowerCase()) > -1
              || element.Answer.toLocaleLowerCase().includes(this.state.searchStr.toLocaleLowerCase())){
            return element
          }
        })
      }

     if (this.state.searchCatIDs.length > 0) {
        questionsClone = questionsClone.filter((element) => {
          if (this.state.searchCatIDs.every(value => element.FAQ_CategoryId.indexOf(value) >=0))
          {
            return element;
          }
        })
      }

      this.setState({
        questionsFiltered: questionsClone
      })
    }
  }
   
  private filterCategory(category: Category, isChecked: boolean) {
    let catIDs: number[] = clone(this.state.searchCatIDs);
    if (isChecked) {
      catIDs.push(category.ID);
    } else {
      catIDs.splice(catIDs.indexOf(category.ID), 1);
    }

    this.setState({
      searchCatIDs: catIDs
    }, () => {
      this.filterFAQ();
    })
  }
}



