import crypto from 'crypto'

export interface PaytmConfig {
  MID: string
  KEY: string
  WEBSITE: string
  INDUSTRY_TYPE: string
  CHANNEL_ID: string
  CALLBACK_URL: string
}

export interface PaytmOrderRequest {
  orderId: string
  amount: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface PaytmTransactionDetails {
  MID: string
  ORDERID: string
  TXNID: string
  TXNAMOUNT: string
  PAYMENTMODE: string
  CURRENCY: string
  TXNDATE: string
  STATUS: string
  RESPCODE: string
  RESPMSG: string
  GATEWAYNAME: string
  BANKTXNID: string
  BANKNAME: string
}

export class PaytmService {
  private static config: PaytmConfig = {
    MID: process.env.PAYTM_MID!,
    KEY: process.env.PAYTM_KEY!,
    WEBSITE: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
    INDUSTRY_TYPE: process.env.PAYTM_INDUSTRY_TYPE || 'Retail',
    CHANNEL_ID: process.env.PAYTM_CHANNEL_ID || 'WEB',
    CALLBACK_URL: process.env.PAYTM_CALLBACK_URL!,
  }

  private static generateChecksum(params: any, key: string): string {
    const sortedKeys = Object.keys(params).sort()
    const paramString = sortedKeys
      .map(k => `${k}=${params[k]}`)
      .join('&')
    
    const hash = crypto
      .createHash('sha256')
      .update(paramString + key)
      .digest('hex')
    
    return hash
  }

  private static verifyChecksum(params: any, checksum: string, key: string): boolean {
    const { CHECKSUMHASH, ...paramsWithoutChecksum } = params
    const generatedChecksum = this.generateChecksum(paramsWithoutChecksum, key)
    return generatedChecksum === checksum
  }

  static async initiateTransaction(orderRequest: PaytmOrderRequest) {
    const params = {
      MID: this.config.MID,
      WEBSITE: this.config.WEBSITE,
      INDUSTRY_TYPE_ID: this.config.INDUSTRY_TYPE,
      CHANNEL_ID: this.config.CHANNEL_ID,
      ORDER_ID: orderRequest.orderId,
      CUST_ID: orderRequest.customerId,
      MOBILE_NO: orderRequest.customerPhone,
      EMAIL: orderRequest.customerEmail,
      TXN_AMOUNT: orderRequest.amount,
      CALLBACK_URL: this.config.CALLBACK_URL,
    }

    const checksum = this.generateChecksum(params, this.config.KEY)

    return {
      ...params,
      CHECKSUMHASH: checksum,
      paytmUrl: this.config.WEBSITE === 'DEFAULT' 
        ? 'https://securegw.paytm.in/order/process'
        : 'https://securegw-stage.paytm.in/order/process'
    }
  }

  static async verifyTransaction(paytmResponse: any): Promise<{
    isValid: boolean
    transactionDetails: PaytmTransactionDetails | null
  }> {
    try {
      const { CHECKSUMHASH, ...params } = paytmResponse
      
      const isValidChecksum = this.verifyChecksum(
        params,
        CHECKSUMHASH,
        this.config.KEY
      )

      if (!isValidChecksum) {
        return { isValid: false, transactionDetails: null }
      }

      // Verify transaction status with Paytm
      const verificationParams = {
        MID: this.config.MID,
        ORDERID: params.ORDERID,
      }

      const verificationChecksum = this.generateChecksum(
        verificationParams,
        this.config.KEY
      )

      const verificationUrl = this.config.WEBSITE === 'DEFAULT'
        ? 'https://securegw.paytm.in/order/status'
        : 'https://securegw-stage.paytm.in/order/status'

      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...verificationParams,
          CHECKSUMHASH: verificationChecksum,
        }),
      })

      const verificationResult = await response.json()

      return {
        isValid: verificationResult.STATUS === 'TXN_SUCCESS',
        transactionDetails: verificationResult as PaytmTransactionDetails,
      }
    } catch (error) {
      console.error('Paytm verification error:', error)
      return { isValid: false, transactionDetails: null }
    }
  }

  static getTransactionStatus(status: string): 'PAID' | 'FAILED' | 'PENDING' {
    switch (status) {
      case 'TXN_SUCCESS':
        return 'PAID'
      case 'TXN_FAILURE':
        return 'FAILED'
      default:
        return 'PENDING'
    }
  }
}
