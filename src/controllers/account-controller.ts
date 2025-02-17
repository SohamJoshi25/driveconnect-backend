import { Request, Response } from "express";
import { AccountModel, IAccount } from "../models/account-model.js";

export const accountInfo = async (request: Request, response: Response): Promise<any> => {
    try {
        const userId = request.session.userId;
        const Accounts: IAccount[] = await AccountModel.find({ userId: userId });
        const _Accounts : Partial<IAccount>[] = new Array();
        Accounts.forEach((account)=>{
            _Accounts.push({_id:account._id,email:account.email,userId:account.userId,createdAt:account.createdAt,updatedAt:account.updatedAt,picture:account.picture})
        })
        return response.status(200).json({"message":"success",accounts:_Accounts})
    } catch (error) {
        console.log(error);
        return response.status(500).json({"error":JSON.stringify(error)})
    }
}