import { DefaultButton, Icon, IconButton, Panel, PrimaryButton, SearchBox, Stack, Text } from 'office-ui-fabric-react';
import *as React from 'react'
import { FAQ } from '../../../models/FAQ';
import styles from './FaqPanel.module.scss';

export interface IFaqPanelSolutionProps {
    questions: FAQ[];
    deleteFAQ: (deletedFAQ: FAQ) => void;
    
}

export interface IFaqPanelSolutionState {
    questionOpened: FAQ;
}


export default class FaqPanelSolution extends React.Component<IFaqPanelSolutionProps, IFaqPanelSolutionState> {
    constructor (props) {
        super(props);
        this.state = {
            questionOpened: null,
        };
    }

  
    render(): React.ReactElement<IFaqPanelSolutionProps> {
    return (
      <div className={styles.panelContainer}>
        <Stack>
        <div style={{margin: "5px"}}/>
          {this.props.questions.map((value, index) => {
            return (
              <div
                className={styles.panelQuestionsContainer}
                onClick={() => this.setState({ questionOpened: value })}
              >
                <div className={styles.questions}>
                  <Text variant='large' >{value.Question}</Text>
                </div>
              </div>
            );
          })}
        </Stack>
        {this.state.questionOpened && (
          <Panel
            isLightDismiss
            headerText={this.state.questionOpened.Question}
            isOpen
            onDismiss={() => this.setState({ questionOpened: null })}
            onRenderFooterContent={() => (
              <>
                <PrimaryButton
                  text="Delete"
                  onClick={() =>
                    this.props.deleteFAQ(this.state.questionOpened)
                  }
                  style={{ margin: "0px 12px 12px 12px" }}
                  iconProps={{ iconName: "Delete" }}
                />
                <DefaultButton
                  text="Cancel"
                  onClick={() => this.setState({ questionOpened: null })}
                />
              </>
            )}
            isFooterAtBottom={true}
          >
            <div className={styles["panelAnswersContainer"]}>
              <br />
              <div>
                <div className={styles.bar} />
                <Text className={styles.answer}>{this.state.questionOpened.Answer}</Text>
              </div>
            </div>
          </Panel>
        )}
      </div>
    );
  }


}
