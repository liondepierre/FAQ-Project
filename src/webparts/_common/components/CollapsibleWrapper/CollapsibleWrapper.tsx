import { DefaultButton, Icon, Label } from "office-ui-fabric-react";
import * as React from "react";
import styles from "./CollapsibleWrapper.module.scss";

export interface ICollapsibleWrapperProps {
  titleElement: JSX.Element;
  defaultOpen?: boolean;
  bgColor?: string;
  children?: React.ReactNode
}

export interface ICollapsibleWrapperState {
  isOpen: boolean;
  height: number;
}
  
  const CollapsibleWrapper = ({titleElement, defaultOpen, bgColor, children}: ICollapsibleWrapperProps) => {

    const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen ? defaultOpen : false);
    const [height, setHeight] = React.useState<number>(0);
    

    let bodyStyle: React.CSSProperties = {};
    if (bgColor) bodyStyle.backgroundColor = bgColor;

    


    const onRefChange: React.LegacyRef<HTMLDivElement> = (node) => {
      setTimeout(() => {
        if (node) {
          setHeight(() => {return node.scrollHeight;})          
        }
      }, 200);
    };
  
    const close = () => {
      setIsOpen((prev) => prev = false )
    }
  
    const open = () => {
      setIsOpen((prev) => prev = true)
    }

    
    return (
      <div className={styles.CollapsibleWrapper} style={{ ...bodyStyle }}>
      <div
        className={styles.controls}
        style={{ backgroundColor: isOpen ? "red" : "transparent" }}
        onClick={() => {
          setIsOpen((prev) => prev = !prev);
        }}
      >
        <Icon
          iconName={"ChevronDown"}
          style={{
            marginLeft: "4px",
            marginRight: "4px",
            marginBottom: "auto",
            marginTop: "16px",
            transform: `rotate(${isOpen ? "0" : "-90deg"})`,
          }}
          className={styles.thearrow}
        />
        {titleElement}
      </div>
      <div
        className={styles.Collapsible}
        ref={onRefChange}
        style={isOpen ? null : { maxHeight: "0px" }}
      >
        <>{children}</>
      </div>
      <div className={styles.hDivider}>
        <div className={styles.shadow}></div>
      </div>
    </div>

    )
  }
  
  export default CollapsibleWrapper

