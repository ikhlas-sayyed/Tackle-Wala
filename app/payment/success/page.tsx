'use client'

import Link from "next/link"

export default function PaymentSuccessPage() {
  return (<>
  {/* write a good order confirmation message page with all tailwindss and icons   */}
  <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
      <svg className="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4 -4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"></path></svg>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
      <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
        {/* <h2 className="font-medium mb-2">Order Summary</h2>
        <p className="text-sm">Order ID: <span className="font-semibold">#123456789</span></p>
        <p className="text-sm">Total Amount: <span className="font-semibold">$99.99</span></p> */}
      </div>
      <Link href="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Continue Shopping</Link>
    </div>
  </div>
  </>)
}
