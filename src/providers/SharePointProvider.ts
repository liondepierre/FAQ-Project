import { IPropertyPaneDropdownOption } from "@microsoft/sp-property-pane";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { IListInfo } from "@pnp/sp/lists";
import { IFAQProvider } from "./FAQProvider";

export interface ISharePointProvider {
    getLists(): Promise<IPropertyPaneDropdownOption[]>;
}

export class SharePointProvider implements ISharePointProvider {
    private _sp: SPFI
  
 
    constructor (context: WebPartContext){
        this._sp = spfi().using(SPFx(context));
    }
 
    public async getLists(): Promise<IPropertyPaneDropdownOption[]> {
        let lists: IListInfo[] = await this._sp.web.lists();
        let options: IPropertyPaneDropdownOption[] = [];
        for (let list of lists){
            options.push({
                key: list["Id"],
                text: list["Title"]
            });   
        }
        return options
    }
}