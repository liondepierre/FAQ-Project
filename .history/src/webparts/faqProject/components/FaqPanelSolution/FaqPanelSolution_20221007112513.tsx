import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ActionButton, BaseButton, Button, ChoiceGroup, DefaultButton, IChoiceGroupOption, Icon, IconButton, Label, Panel, PanelType, PrimaryButton, SearchBox, Stack, Text } from 'office-ui-fabric-react';
import *as React from 'react'
import { useState } from 'react';
import { IFAQ } from '../../../models/FAQ';
import styles from './FaqPanel.module.scss';

export interface IFaqPanelSolutionProps {
    questions: IFAQ[];
    isAdmin: boolean;
    deleteFAQ: (deletedFAQ: IFAQ) => void;
    updateFAQ: (FAQtoUpdate: IFAQ) => void;
}




const FaqPanelSolution = ({questions, isAdmin, deleteFAQ, updateFAQ}: IFaqPanelSolutionProps) => {

  const [questionOpened, setQuestionOpened] = useState<IFAQ>(null);

  const onPanelClick = (value: IFAQ) => {
    setQuestionOpened((prev) => prev = value);
  }
  
  const onPanelClickNull = (): void => {
    setQuestionOpened((prev: IFAQ) => prev = null);
  }


  return (
    <div className={styles.panelContainer}>
      <Stack>
        <div style={{ margin: "5px" }} />
        {questions.map((value, index) => {
          return (
            <div
              className={styles.panelQuestionsContainer}
              onClick={() => onPanelClick(value)}
            >
              <Stack
                tokens={{ childrenGap: "7px" }}
                horizontal
                className={styles.questions}
              >
                <Icon className={styles.plusIcon} iconName="ChevronRight" />
                <Text variant="large">{value.Question}</Text>
              </Stack>
              <div className={styles.hDivider}>
                <div className={styles.shadow}></div>
              </div>
            </div>
          );
        })}
      </Stack>

      {questionOpened && (
        <Panel
          customWidth="415px"
          type={PanelType.custom}
          isLightDismiss
          headerText={questionOpened.Question}
          isOpen
          onDismiss={() => onPanelClickNull()}
          onRenderFooterContent={() => (
            <Stack horizontal>
              {isAdmin && (
                <Stack horizontal>
                  <PrimaryButton
                    text="Delete"
                    onClick={() =>
                      deleteFAQ(questionOpened)
                    }
                    style={{ margin: "0px 12px 12px 12px" }}
                    iconProps={{ iconName: "Delete" }}
                  />
                  <PrimaryButton
                    text="Update"
                    onClick={() =>
                      updateFAQ(questionOpened)
                    }
                    style={{
                      borderColor: "grey",
                      backgroundColor: "grey",
                      margin: "0px 12px 12px 0px",
                    }}
                    iconProps={{ iconName: "Edit" }}
                  />
                </Stack>
              )}
              <Stack horizontal>
                <DefaultButton
                  style={{
                    paddingLeft: "30px",
                    paddingRight: "30px",
                    margin: "0px 12px 12px 0px",
                  }}
                  text="Cancel"
                  onClick={() => onPanelClickNull()}
                />
              </Stack>
            </Stack>
          )}
          isFooterAtBottom={true}
        >
          <div className={styles["panelAnswersContainer"]}>
            <br />
            <div>
              <div
                style={{ margin: "0px 15px 15px 15px" }}
                className={styles.bar}
              />
              {/* <Text className={styles.answer}>
                  {questionOpened.Answer}
                </Text> */}

                 <div
                    dangerouslySetInnerHTML={{ __html: questionOpened.Answer }}
                    style={{
                      paddingRight: "22px",
                      paddingLeft: "22px",
                      display: "inline-block",
                      fontFamily: "Segoe UI",
                      fontWeight: "normal",
                      fontSize: "18px",
                    }}
                  />
              
            </div>
            <div className={styles.bar} />
            <div>
            {questionOpened.FAQ_Category.map((cat, index) => {
              return (
                <Text
                  style={{
                    marginLeft: "15px",
                    color: "white",
                    paddingTop: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    paddingBottom: "7px",
                    background: cat.CategoryColor,
                    borderRadius: "5px",
                    fontFamily: "Segoe UI",
                    fontWeight: "normal",
                    fontSize: "13px",
                  }}
                  variant="medium"
                >
                  {cat.Title}
                </Text>
              );
            })}
            </div>
            <div  style={{marginTop: "15px"}}>
            {questionOpened.FAQ_SubCategory.map((cat, index) => {
              return (
                <Text
                  style={{
                    marginLeft: "15px",
                    color: "white",
                    paddingTop: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    paddingBottom: "7px",
                    background: cat.SubCategoryColor,
                    borderRadius: "5px",
                    fontFamily: "Segoe UI",
                    fontWeight: "normal",
                    fontSize: "13px",
                  }}
                  variant="medium"
                >
                  {cat.Title}
                </Text>
              );
            })}
            </div>
            
            <div className={styles.bar} />
          </div>
        </Panel>
      )}
    </div>
  );
};


export default FaqPanelSolution
