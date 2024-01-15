import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SearchQueryInit, spfi, SPFI, SPFx } from "@pnp/sp/presets/all";
import { IFAQ } from "../webparts/models/IFAQ";
import { MSGraphClient } from '@microsoft/sp-http';


export interface IFAQProvider {
    getFAQ(): Promise<IFAQ[]>;
    deleteFAQ(faq: IFAQ): Promise<void>;
    createUpdateFaq(faq: IFAQ): Promise<void>;
    generateEmptyFAQ(): IFAQ;
}

export class FAQProvider implements IFAQProvider {
    private _sp: SPFI;
    private faqListId: string;
    private graphClient: MSGraphClient;


    constructor(context: WebPartContext, faqListId: string) {
        this._sp = spfi().using(SPFx(context));
        this.faqListId = faqListId;
        this.getGraphClient(context);
    }


    public async getFAQ(): Promise<IFAQ[]> {
        let result: IFAQ[] = await this._sp.web.lists
            .getById(this.faqListId).items
            .expand("FAQ_Category", "FAQ_SubCategory")
            .select("*", "FAQ_Category/Title", "FAQ_SubCategory/Title", "FAQ_Category/CategoryColor", "FAQ_SubCategory/SubCategoryColor")();

            const k = ((await this._sp.web.currentUser()).Email)
            console.log(k);
            this.graphClient
            .api(`users/${k}/transitiveMemberOf/microsoft.graph.group?$filter=startswith(displayName, 'a')`)
            .version("v1.0")
            .select("")
            .top(5)
            .get((err: any, res: any): void => {
              if (err) {
                console.log("Getting error in retrieving mesages =>", err)
              }
              if (res) {
                console.log("Success");
                if (res && res.value.length) {
                  console.log(res);
                }
              }
            });
                  
            console.log(result);
        
        let resultFiltered: IFAQ[] = result.map(x => ({
            Answer: x.Answer,
            FAQ_CategoryId: x.FAQ_CategoryId,
            FAQ_SubCategoryId: x.FAQ_SubCategoryId,
            Question: x.Question,
            FAQ_Category: x.FAQ_Category,
            FAQ_SubCategory: x.FAQ_SubCategory,
            ID: x.ID,
            Audience_Target: x.Audience_Target,
            Audience_TargetId: x.Audience_TargetId,
        }));
        

        return resultFiltered;
    }


    private async createFAQ(newFAQ: IFAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.add(newFAQ);
    }

    private async updateFAQ(updateFAQ: IFAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.getById(updateFAQ.ID).update(updateFAQ);
    }

    public async deleteFAQ(faq: IFAQ): Promise<void> {
        await this._sp.web.lists.getById(this.faqListId).items.getById(faq.ID).delete();
    }

    public async createUpdateFaq(faq: IFAQ): Promise<void> {
        let faqResult = {
            ID: faq.ID,
            Question: faq.Question,
            Answer: faq.Answer,
            FAQ_CategoryId: faq.FAQ_CategoryId,
            FAQ_SubCategoryId: faq.FAQ_SubCategoryId,
        } as any;

        if (faq.Audience_Target) {
            faqResult.Audience_TargetId = faq.Audience_Target.map((x) => x.id);
        }
        if (!faqResult.ID) {
            await this.createFAQ(faqResult);
        } else {
            await this.updateFAQ(faqResult);
        }
    }

    public generateEmptyFAQ(): IFAQ {
        return {
            ID: null,
            Question: "",
            Answer: "",
            FAQ_CategoryId: [],
            FAQ_SubCategoryId: [],
            Audience_TargetId: [],
        };
    }

    private async getGraphClient (context: WebPartContext): Promise<void> {
        this.graphClient = await context.msGraphClientFactory.getClient();
    }

}