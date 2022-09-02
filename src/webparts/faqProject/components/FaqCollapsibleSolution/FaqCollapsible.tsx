import { WebPartContext } from '@microsoft/sp-webpart-base';
import { CommandButton, DefaultButton, Dialog, DialogFooter, Icon, IconButton, Panel, PrimaryButton, SearchBox, Spinner, Stack, Text } from 'office-ui-fabric-react';
import *as React from 'react'
import { FAQProvider, IFAQProvider } from '../../../../providers/FAQProvider';
import { FAQ } from '../../../models/FAQ';
import CollapsibleWrapper from '../../../_common/components/CollapsibleWrapper/CollapsibleWrapper';
import { IFaqProjectState } from '../FaqProject';
import styles from './FaqCollapsible.module.scss';

export interface IFaqCollapsibleProps {
  questions: FAQ[];
  deleteFAQ: (deletedFAQ: FAQ) => void;
  updateFAQ: (FAQtoUpdate: FAQ) => void;
  isAdmin: boolean;
}

export interface IFaqCollapsibleState {
}


export default class FaqCollapsible extends React.Component<IFaqCollapsibleProps, IFaqCollapsibleState> {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  
  render(): React.ReactElement<IFaqCollapsibleProps> {
    return (
      <div>
        <Stack tabIndex={1} className={styles.collapseContainer}>
          {this.props.questions.map((element, i) => {
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
                    <Text
                      style={{
                        paddingRight: "22px",
                        paddingLeft: "22px",
                        display: "inline-block",
                        fontFamily: "Segoe UI",
                        fontWeight: "normal",
                        fontSize: "18px",
                      }}
                    >
                      {element.Answer}
                    </Text>

                    {this.props.isAdmin && (
                      <Stack horizontal>
                        <IconButton
                          onClick={() => this.props.deleteFAQ(element)}
                          style={{ margin: "0px 0px 0px 13px" }}
                          iconProps={{ iconName: "Delete" }}
                        />

                        <IconButton
                          onClick={() => this.props.updateFAQ(element)}
                          iconProps={{ iconName: "Edit" }}
                        />
                      </Stack>
                    )}
                  </div>
                </CollapsibleWrapper>
              );
            })}
        </Stack>
      </div>
    );
  }
}
