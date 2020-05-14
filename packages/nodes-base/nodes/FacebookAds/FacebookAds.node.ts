import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
    INodeTypeDescription,
    IDataObject
} from 'n8n-workflow';
import { adOperations, adFields } from './AdAccountInsightDescription';
import { IAdInsightParameters, IFilter, ITimeRange } from './AdInsightInterface';
import { validateJSON, facebookAdsApiRequest } from './GenericFunctions';


export class FacebookAds implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Ads',
        name: 'facebookAds',
		icon: 'file:facebookads.png',
		group: ['transform'],
		version: 1,
		description: 'Consume Facebook Ads API.',
		defaults: {
			name: 'DisplayNameReplace',
			color: '#772244',
		},
		inputs: ['main'],
        outputs: ['main'],
        credentials: [
			{
				name: 'facebookAdsApi',
				required: true,
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Ad',
                        value: 'ad'
                    },
                    {
                        name: 'Ad Account',
                        value: 'adAccount'
                    },
                    {
                        name: 'Ad Campaign',
                        value: 'adCampaign'
                    },
                    {
                        name: 'Ad Set',
                        value: 'adSet'
                    }
                ],
				default: 'ad',
				description: 'The description text',
            },
            
            // Ad Account
            ...adOperations,
            ...adFields
		]
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items = this.getInputData();
        const returnData : INodeExecutionData[] = [];
        let responseData;
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            if (resource === 'adAccount' || resource === 'ad' || resource === 'adSet' || resource === 'adCampaign') {
                if (operation === 'get' || operation === 'create') {
                    const jsonParameters = this.getNodeParameter('jsonParameters', itemIndex) as boolean;
                    const body : IAdInsightParameters = {};
                    const itemId : string = this.getNodeParameter('itemId', itemIndex) as string;

                    if (jsonParameters) {
                        const additionalFieldsJson = this.getNodeParameter('additionalFieldsJson', itemIndex) as string;

                        if (additionalFieldsJson !== '') {
                            if(validateJSON(additionalFieldsJson) !== undefined) {
                                Object.assign(body, JSON.parse(additionalFieldsJson));

                            } else {
                                throw new Error('Additional fields must be a valid JSON.');
                            }
                        }
                        } else {
                            const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;


                            if (additionalFields.actionAttributionWindows) {
                                //@ts-ignore
                                body.action_attribution_windows = additionalFields.actionAttributionWindows.properties as string[];
                            }
                            if (additionalFields.actionBreakdowns) {
                                //@ts-ignore
                                body.action_breakdowns = additionalFields.actionBreakdowns.properties.breakdowns as string[];
                            }
                            if (additionalFields.actionReportTime) {
                                body.action_report_time = additionalFields.actionReportTime as string;
                            }
                            if (additionalFields.breakdowns) {
                                //@ts-ignore
                                body.breakdowns = additionalFields.breakdowns.split(',') as string[];
                            }
                            if (additionalFields.dataPreset) { 
                                body.date_preset = additionalFields.datePreset as string;
                            }
                            if (additionalFields.defaultSummary) {
                                body.default_summary = additionalFields.defaultSummary as boolean;
                            }
                            if (additionalFields.exportColumns) {
                                //@ts-ignore
                                body.export_columns = additionalFields.exportColumns.split(',') as string[];
                            }
                            if (additionalFields.export_format) {
                                body.export_format = additionalFields.exportFormat as string;
                            }
                            if (additionalFields.exportName) { 
                                body.export_name = additionalFields.exportName as string;
                            }
                            if (additionalFields.fields) {
                                //@ts-ignore
                                body.fields = additionalFields.fields.split(',') as string[];
                            }
                            if (additionalFields.filters) {
                                //@ts-ignore
                                body.filtering = additionalFields.filters.properties as IFilter[];
                            }
                            if (additionalFields.level) {
                                body.level = additionalFields.level as string;
                            }
                            if (additionalFields.productIdLimit) {
                                body.product_id_limit = additionalFields.productIdLimit as number;
                            }
                            if (additionalFields.sort) {
                                //@ts-ignore
                                if(additionalFields.sort.properties.type === 'Field') {
                                    //@ts-ignore
                                    body.sort = [`${additionalFields.sort.properties.field}_${additionalFields.sort.properties.order}`];
                                } else {
                                    //@ts-ignore
                                    body.sort = [`actions:${additionalFields.sort.properties.field}_${additionalFields.sort.properties.order}`];
                                }
                            }
                            if (additionalFields.summary) {
                                //@ts-ignore
                                body.summary = additionalFields.summary.split(',') as string[];
                            }
                            if (additionalFields.summaryActionBreakdowns) {
                                //@ts-ignore
                                body.summary_action_breakdowns = additionalFields.summaryActionBreakdowns.properties as string[];
                            }
                            if (additionalFields.timeIncrement) {
                                //@ts-ignore
                                body.time_increment = additionalFields.timeIncrement.properties.increment as string | number;
                            }
                            if (additionalFields.timeRange) {
                                body.time_range = additionalFields.timeRange as ITimeRange;
                            }
                            if (additionalFields.timeRanges) {
                                //@ts-ignore
                                body.time_ranges = additionalFields.timeRanges.properties as ITimeRange[];
                            }
                            if (additionalFields.useAccountAttributionSetting) {
                                body.use_account_attribution_setting = additionalFields.useAccountAttributionSetting as boolean;
                            }

                            let endpoint : string;
                            let method : string;

                            if (operation === 'create') {
                                endpoint = `${itemId}/insights`;
                                method = 'POST';
                                responseData = await facebookAdsApiRequest.call(this, method, endpoint, body);
                            }
                            if (operation === 'get') {
                                endpoint = `${itemId}/insights`;
                                method = 'GET';
                                responseData = await facebookAdsApiRequest.call(this, method, endpoint, body);
                            }
                        }
                }

            }
            
            if (Array.isArray(responseData)) {
                returnData.push.apply(returnData, responseData as INodeExecutionData[]);
            } else {
                returnData.push(responseData as INodeExecutionData);
            }
		}
		return this.prepareOutputData(returnData);
	}
}