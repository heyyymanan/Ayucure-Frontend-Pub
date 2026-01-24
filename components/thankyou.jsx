'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OrderConfirmed } from '@/components/ui/order_confirmed'
import Link from 'next/link'
import { Button } from './ui/button'


export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const router = useRouter()

  useEffect(() => {
    if (!orderId) {
      router.replace('/')
    }
  }, [orderId, router])

  if (!orderId) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-start mt-10 px-2">
      <OrderConfirmed />
      <h1 className="text-3xl font-bold text-green-500 font-serif">Order Confirmed !</h1>
      <p className="mt-2 text-lg text-gray-700">Thank You For Your Purchase! 🛒</p>
      {/* <p className="mt-1 text-sm text-gray-500">
        Your Order ID : #<strong>{orderId}</strong>
      </p> */}
      <br/>
      <p className='text-red-500 text-center'>We Will Update You Through <br/><strong>Whatsapp</strong> Or <strong>SMS</strong> Now.</p>
      <div className="flex items-center justify-center mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-medium text-primary-700"
        >
          <Button className='bg-lime-500 text-lg text-black'>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
