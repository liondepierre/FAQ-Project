import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SearchQueryInit, spfi, SPFI, SPFx } from "@pnp/sp/presets/all";
import { FAQ } from "../webparts/models/FAQ";


export interface IFAQProvider {
    getFAQ(): Promise<FAQ[]>;
    deleteFAQ(faq: FAQ): Promise<void>;
    createUpdateFaq(faq: FAQ): Promise<void>;
    generateEmptyFAQ(): FAQ;
}

export class FAQProvider implements IFAQProvider {
    private _sp: SPFI;
    private faqListId: string;

    constructor(context: WebPartContext, faqListId: string) {
        this._sp = spfi().using(SPFx(context));
        this.faqListId =  faqListId;
    }

    public async getFAQ(): Promise<FAQ[]> {
        let result: FAQ[] = await this._sp.web.lists.getById(this.faqListId).items.expand("FAQ_Category").select("*", "FAQ_Category/Title")();
        console.log(result);
        // let a: SearchQueryInit = "ContentTypeId:0x01010082DE4C68DDBD144E861E8C837F07E288009EDF37AC959E3F488CD967D8721FAD76 OR ContentTypeId:0x010100E550EBF08F850D4A8055AF551CBE6A8700F14E1E5A2B6C0646B48C40C5B67A7F41 OR 0x010100DABA81849830474BB2DF779CA2D9CEBF"; 
        // this._sp.search(a).
        
        return result;
    }

    private async createFAQ(newFAQ: FAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.add(newFAQ);
    } 

    public async deleteFAQ(faq: FAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.getById(faq.ID).delete();
    }

    public async createUpdateFaq(faq: FAQ): Promise<void>{
        delete faq["odata.editLink"];
        delete faq["odata.etag"];
        delete faq["odata.id"];
        delete faq["odata.type"];
        if (!faq.ID) {
            await this.createFAQ(faq);
        } else {
            await this.updateFAQ(faq);
        }
    }

    private async updateFAQ(updateFAQ: FAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.getById(updateFAQ.ID).update(updateFAQ);
    }

    public generateEmptyFAQ(): FAQ {
        return {
          ID: null,
          Question: "",
          Answer: "",
          FAQ_CategoryId: [],
        };
    }
}
