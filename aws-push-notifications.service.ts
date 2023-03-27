import * as AWS from 'aws-sdk'

import { Injectable } from '@nestjs/common'

import { EnvironmentService } from '../core/environment'

@Injectable()
export class AwsPushNotificationsService {
  constructor(private readonly env: EnvironmentService) {}

  async sendPushNotification(query: {
    deviceToken: string
    title: string
    message: string
    platform: string
  }) {
    try {
      const apiVersion = '2016-12-01'
      const awsConfig = {
        apiVersion,
        accessKey: this.env.get('AWS_ACCESS_KEY_ID'),
        secretKey: this.env.get('AWS_SECRET_ACCESS_KEY'),
        // sessionToken: process.env.AWS_SESSION_TOKEN,
        // region: process.env.AWS_REGION,
        region: 'us-east-1',
      }
      const sns = new AWS.SNS(awsConfig)
      let endPointArn
      let notificationPayload: string

      console.log('query', query)

      if (query.platform === 'android') {
        try {
          endPointArn = await sns
            .createPlatformEndpoint({
              PlatformApplicationArn: this.env.get('PLATFORM_ENDPOINT_ANDROID'),
              Token: query.deviceToken,
              Attributes: {
                Enabled: 'true',
              },
            })
            .promise()
          console.log('Endpoint Data', endPointArn)

          notificationPayload = JSON.stringify({
            default: 'SEEN',
            priority: 'high',
            GCM: JSON.stringify({
              notification: {
                body: query.message,
                title: query.title,
              },
              data: {
                message: query.message,
                title: query.title,
              },
            }),
          })
        } catch (error) {
          console.log('android error', error)
          throw error
        }
      } else if (query.platform === 'ios') {
        try {
          endPointArn = await sns
            .createPlatformEndpoint({
              PlatformApplicationArn: this.env.get('PLATFORM_ENDPOINT_IOS'),
              Token: query.deviceToken,
              Attributes: {
                Enabled: 'true',
              },
            })
            .promise()
          console.log('Endpoint Data', endPointArn)

          notificationPayload = JSON.stringify({
            default: 'SEEN',
            priority: 'high',
            APNS: JSON.stringify({
              aps: {
                alert: {
                  title: query.title,
                  body: query.message,
                },
              },
            }),
          })
        } catch (error) {
          console.log('ios error', error)
          throw error
        }
      }

      console.log('notificationPayload', notificationPayload)
      
      const data = await sns
        .publish({
          Message: notificationPayload,
          MessageStructure: 'json',
          TargetArn: endPointArn.EndpointArn,
        })
        .promise()
      console.log('Push Notification Data', data)
      return true
    
    } catch (error) {
      console.error('AwsSnsPushNotification', error)
    }
  }
}
