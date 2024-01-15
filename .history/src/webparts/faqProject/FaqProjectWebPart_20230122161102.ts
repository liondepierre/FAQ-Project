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
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { IPropertyFieldGroupOrPerson, PropertyFieldDropdownWithCallout, PropertyFieldPeoplePicker } from '@pnp/spfx-property-controls';
import { CalloutTriggers } from '@pnp/spfx-property-controls/lib/PropertyFieldHeader';
import { PropertyFieldToggleWithCallout } from '@pnp/spfx-property-controls/lib/PropertyFieldToggleWithCallout';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { TargetGroup } from '../models/TargetGroup';
import { IPersonaProps } from 'office-ui-fabric-react';
import { graphfi } from '@pnp/graph';



export interface IFaqProjectWebPartProps {
  description: string;
  faqListId: string;
  categoryListId: string;
  subCategoryListId: string;
  panelViewToggle: boolean;
  people: IPropertyFieldGroupOrPerson[];
  targetingData: TargetGroup[];
}

export default class FaqProjectWebPart extends BaseClientSideWebPart<IFaqProjectWebPartProps> {

  public onInit(): Promise<void> {

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
        subCategoryListId: this.properties.subCategoryListId,
        people: this.properties.people,
        targetingData: this.properties.targetingData,
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
                PropertyFieldListPicker('subCategoryListId', {
                  context: this.context as any,
                  label: "Pick A Sub Category List",
                  key: "subCategoryListId",
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  selectedList: this.properties.subCategoryListId,
                }),
                PropertyFieldToggleWithCallout("panelViewToggle", {
                  label: "Select View",
                  key: "panelViewToggle",
                  calloutTrigger: CalloutTriggers.Click,
                  onText: "Panel",
                  offText: "Collapsible",
                  checked: this.properties.panelViewToggle
                }),
                PropertyFieldCollectionData("targetingData", {
                  key: "collectionData",
                  label: "Collection data",
                  panelHeader: "Collection data panel header",
                  manageBtnLabel: "Manage collection data",
                  value: this.properties.targetingData,
                  fields: [
                    {
                      id: "title",
                      title: "Title",
                      type: CustomCollectionFieldType.string,
                      required: false
                    },
                    {
                      id: "group",
                      title: "Group",
                      type: CustomCollectionFieldType.custom,
                      onCustomRender: (field, value, onUpdate, item: TargetGroup, itemId, onError) => {
                        return (
                          React.createElement(
                            PeoplePicker, {
                            context: this.context as any,
                            personSelectionLimit: 999,
                            key: itemId,
                            defaultSelectedUsers: (item.group != null && item.group.length > 0 && item.group.map(v => { return v.text })),
                            principalTypes: [PrincipalType.SecurityGroup],
                            ensureUser: true,
                            onChange: (items: IPersonaProps[]) => {
                              item.group = items;
                              onUpdate(field.id, items);
                            },
                            showHiddenInUI: false,
                            required: true,
                          })
                        )
                      },
                    },
                  ],
                  disabled: false
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
