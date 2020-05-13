import { OptionsWithUri } from 'request';
import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IExecuteSingleFunctions,
} from 'n8n-core';
import { IDataObject } from 'n8n-workflow';

export async function facebookAdsApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('facebookAdsApi');
	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	let options: OptionsWithUri = {
		method,
		qs,
		body : {access_token : credentials.access_token},
		uri: uri ||`https://graph.facebook.com/v7.0/${resource}`,
		json: true
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body).length === 0) {
		delete options.body;
    }
    
    console.log(options);

	try {
		return await this.helpers.request!(options);
	} catch (error) {
        console.log(error);
	}
}

export function validateJSON(json : string | undefined) : {} | undefined {
    let result;
    try {
        result = JSON.parse(json!);
    } catch (exception) {
        result = undefined;
    }
    return result;
}