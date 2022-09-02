import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import * as strings from 'FaqProjectWebPartStrings';
import FaqProject from './components/FaqProject';
import { IFaqProjectProps } from './components/FaqProject';
// import { setup as pnpSetup} from "@pnp/sp";
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { ISharePointProvider, SharePointProvider } from '../../providers/SharePointProvider';
import { PropertyFieldDropdownWithCallout } from '@pnp/spfx-property-controls';
import { CalloutTriggers } from '@pnp/spfx-property-controls/lib/PropertyFieldHeader';
import { PropertyFieldToggleWithCallout } from '@pnp/spfx-property-controls/lib/PropertyFieldToggleWithCallout';


export interface IFaqProjectWebPartProps {
  description: string;
  faqListId: string;
  categoryListId: string;
  panelViewToggle: boolean;
}

export default class FaqProjectWebPart extends BaseClientSideWebPart<IFaqProjectWebPartProps> {

  private SharePointProvider: ISharePointProvider = new SharePointProvider(this.context)


  public onInit(): Promise <void> {
    return Promise.resolve();
  }


  public render(): void {
    const element: React.ReactElement<IFaqProjectProps> = React.createElement(
      FaqProject,
      {
        description: this.properties.description,
        context: this.context,
        faqListId: this.properties.faqListId,
        panelViewToggle: this.properties.panelViewToggle,
        categoryListId: this.properties.categoryListId,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyFieldListPicker('faqListId', {
                  context: this.context as any,
                  label: 'Pick FAQ list',
                  key: "faqListId",
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  selectedList: this.properties.faqListId,
                }),
                PropertyFieldListPicker('categoryListId', {
                  context: this.context as any,
                  label: 'Pick Category list',
                  key: "categoryListId",
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  selectedList: this.properties.categoryListId,
                }),
                PropertyFieldToggleWithCallout("panelViewToggle", {
                  label: "Select View",
                  key: "panelViewToggle",
                  calloutTrigger: CalloutTriggers.Click,
                  calloutContent: React.createElement("p", {}, "With this control you can enable or disable the PnP fetures in your web part"),
                  onText: "Panel",
                  offText: "Collapsible",
                  checked: this.properties.panelViewToggle
                }),
                



                // PropertyFieldDropdownWithCallout("dropdownLists", {
                //   label: "Select lists",
                //   options: [],
                //   key: "dropdownLists",

                // })
              ]
            }
          ]
        }
      ]
    };
  }
}
