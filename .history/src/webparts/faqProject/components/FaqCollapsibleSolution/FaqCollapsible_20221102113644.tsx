import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Callout, CommandButton, DefaultButton, Dialog, DialogFooter, Icon, IconButton, Panel, PrimaryButton, SearchBox, Spinner, Stack, Text } from 'office-ui-fabric-react';
import *as React from 'react'
import { FAQProvider, IFAQProvider } from '../../../../providers/FAQProvider';
import { Category } from '../../../models/Category';
import { IFAQ } from '../../../models/IFAQ';
import CollapsibleWrapper from '../../../_common/components/CollapsibleWrapper/CollapsibleWrapper';
import styles from './FaqCollapsible.module.scss';

export interface IFaqCollapsibleProps {
  questions: IFAQ[];
  deleteFAQ: (deletedFAQ: IFAQ) => void;
  updateFAQ: (FAQtoUpdate: IFAQ) => void;
  isAdmin: boolean;
}

  const FaqCollapsible = ({questions, deleteFAQ, updateFAQ, isAdmin}: IFaqCollapsibleProps) => {
    return (
      <div>
      <Stack tabIndex={1} className={styles.collapseContainer}>
        {questions.map((element, i) => {
          return (
            <CollapsibleWrapper
              titleElement={
                <div className={styles.questionsContainer}>
                  <Text
                    variant="large"
                    style={{
                      paddingBottom: "10px",
                      paddingTop: "10px",
                      display: "flex",
                    }}
                  >
                    {element.Question}
                  </Text>
                </div>
              }
            >
              <div className={styles.collapsibleAnswerContainer}>
                {element.FAQ_Category.map((category, index) => {
                  return (
                    <Text className={styles.category}
                      style={{background: category.CategoryColor}}
                    > 
                      {category.Title}
                    </Text>
                  );
                }).reverse()} 
                <Stack
                  style={{ marginTop: "9px", marginBottom: "3px", marginLeft: "17px" }}
                  horizontal
                  tokens={{ childrenGap: "5px" }}
                >
                  {element.FAQ_SubCategory.map((subCategory, index) => {
                    return (
                      <Text
                        style={{
                          color: "white",
                          paddingTop: "7px",
                          paddingRight: "8px",
                          paddingLeft: "8px",
                          paddingBottom: "7px",
                          background: subCategory.SubCategoryColor,
                          borderRadius: "5px",
                        }}
                      > 
                        {subCategory.Title} 
                      </Text>
                    );
                  })}
                </Stack>
               
                <Stack tokens={{childrenGap: "5px"}}>
                  <div
                    dangerouslySetInnerHTML={{ __html: element.Answer }}
                    style={{
                      marginTop: "0px",
                      paddingRight: "22px",
                      paddingLeft: "22px",
                      display: "inline-block",
                      fontFamily: "Segoe UI",
                      fontWeight: "normal",
                      fontSize: "18px",
                    }}
                  > 
                  {/* {element.Answer} */}
                  </div>
                  <Stack horizontal>
                    {isAdmin && (
                      <IconButton
                        onClick={() => updateFAQ(element)}
                        style={{
                          paddingBottom: "6px",
                          margin: "0px 0px 0px 10px",
                        }}
                        iconProps={{ iconName: "Edit" }}
                      />
                    )}
                    {isAdmin && (
                      <IconButton
                        onClick={() => deleteFAQ(element)}
                        style={{
                          paddingBottom: "6px",
                          margin: "0px 0px 0px 1px",
                        }}
                        iconProps={{ iconName: "Delete" }}
                      />
                    )}
                  </Stack>
                </Stack>
              </div>
            </CollapsibleWrapper>
          );
        })}
        
      </Stack>
    </div>
    )
  }
  

  export default FaqCollapsible
