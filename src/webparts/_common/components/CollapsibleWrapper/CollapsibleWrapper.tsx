import { DefaultButton, Icon, Label } from "office-ui-fabric-react";
import * as React from "react";
import styles from "./CollapsibleWrapper.module.scss";

export interface ICollapsibleWrapperProps {
  titleElement: JSX.Element;
  defaultOpen?: boolean;
  bgColor?: string;
}

export interface ICollapsibleWrapperState {
  isOpen: boolean;
  height: number;
}

export default class CollapsibleWrapper extends React.Component<ICollapsibleWrapperProps,ICollapsibleWrapperState> {
  constructor(props: ICollapsibleWrapperProps) {
    super(props);
    this.state = {
      isOpen: this.props.defaultOpen ? this.props.defaultOpen : false,
      height: 0,
    };
  }

  private onRefChange: React.LegacyRef<HTMLDivElement> = (node) => {
    setTimeout(() => {
      if (node) {
        this.setState({ height: node.scrollHeight });
      }
    }, 200);
  };

  public close() {
    this.setState({ isOpen: false });
  }

  public open() {
    this.setState({ isOpen: true });
  }

  public render(): React.ReactElement<ICollapsibleWrapperState> {
    let bodyStyle: React.CSSProperties = {};
    if (this.props.bgColor) bodyStyle.backgroundColor = this.props.bgColor;

    return (
      <div className={styles.CollapsibleWrapper} style={{...bodyStyle }}>

        <div
          className={styles.controls}
          onClick={() => {
            this.setState({ isOpen: !this.state.isOpen });
          }}
        >
            <Icon
            iconName={"ChevronDown"}
            style={{
             marginLeft: "4px", marginRight: "4px", marginBottom: "auto", marginTop: "13px", transform: `rotate(${this.state.isOpen ? "0" : "-90deg"})`,
            }}
            className={styles.thearrow}
          />
          {this.props.titleElement}
        </div>
        <div
          className={styles.Collapsible}
          ref={this.onRefChange}
          style={this.state.isOpen ? null : {maxHeight: "0px" }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
