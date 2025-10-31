import requests
import base64
import json
from datetime import datetime
import os
from flask import current_app

class MpesaAPI:
    def __init__(self):
        self.consumer_key = os.environ.get('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.environ.get('MPESA_CONSUMER_SECRET')
        self.shortcode = os.environ.get('MPESA_SHORTCODE')
        self.passkey = os.environ.get('MPESA_PASSKEY')
        self.callback_url = os.environ.get('MPESA_CALLBACK_URL')
        self.base_url = 'https://sandbox.safaricom.co.ke'  # Use production URL in production

    def get_access_token(self):
        """Get M-Pesa access token"""
        try:
            # Encode consumer key and secret
            credentials = base64.b64encode(
                f"{self.consumer_key}:{self.consumer_secret}".encode()
            ).decode()

            headers = {
                'Authorization': f'Basic {credentials}',
                'Content-Type': 'application/json'
            }

            response = requests.get(
                f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials',
                headers=headers
            )

            if response.status_code == 200:
                return response.json()['access_token']
            else:
                raise Exception(f"Failed to get access token: {response.text}")

        except Exception as e:
            current_app.logger.error(f"Error getting M-Pesa access token: {str(e)}")
            raise

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """Initiate STK Push"""
        try:
            access_token = self.get_access_token()

            # Format phone number (remove + and ensure it starts with 254)
            if phone_number.startswith('+'):
                phone_number = phone_number[1:]
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]

            # Generate timestamp
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

            # Generate password
            password = base64.b64encode(
                f"{self.shortcode}{self.passkey}{timestamp}".encode()
            ).decode()

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': amount,
                'PartyA': phone_number,
                'PartyB': self.shortcode,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }

            response = requests.post(
                f'{self.base_url}/mpesa/stkpush/v1/processrequest',
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                if result.get('ResponseCode') == '0':
                    return {
                        'success': True,
                        'checkout_request_id': result.get('CheckoutRequestID'),
                        'response_code': result.get('ResponseCode'),
                        'response_description': result.get('ResponseDescription'),
                        'customer_message': result.get('CustomerMessage')
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('ResponseDescription', 'STK Push failed')
                    }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }

        except Exception as e:
            current_app.logger.error(f"Error initiating STK Push: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def query_stk_push_status(self, checkout_request_id):
        """Query STK Push payment status"""
        try:
            access_token = self.get_access_token()

            # Generate timestamp
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

            # Generate password
            password = base64.b64encode(
                f"{self.shortcode}{self.passkey}{timestamp}".encode()
            ).decode()

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }

            response = requests.post(
                f'{self.base_url}/mpesa/stkpushquery/v1/query',
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'response_code': result.get('ResponseCode'),
                    'response_description': result.get('ResponseDescription'),
                    'result_code': result.get('ResultCode'),
                    'result_desc': result.get('ResultDesc')
                }
            else:
                return {
                    'error': f"HTTP {response.status_code}: {response.text}"
                }

        except Exception as e:
            current_app.logger.error(f"Error querying STK Push status: {str(e)}")
            return {
                'error': str(e)
            }

# Global instance
mpesa_api = MpesaAPI()
