import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const USDT_WALLET = Deno.env.get('USDT_WALLET')! 
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { txHash, userUrl, imageUrl, tier, lat, lon } = await req.json()

    // 1. Запрашиваем инфу о транзакции в TronScan
    const tronRes = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txHash}`)
    if (!tronRes.ok) throw new Error('Ошибка API TronScan')
    const txInfo = await tronRes.json()

    // 2. Проверяем, что транзакция подтверждена
    if (!txInfo.confirmed || txInfo.contractRet !== 'SUCCESS') {
      return new Response(JSON.stringify({ error: 'Transaction is not confirmed yet. Please wait 1-2 minutes.' }), { headers: corsHeaders })
    }

    // 3. Проверяем, что это перевод USDT на наш кошелек
    const transfer = txInfo.trc20TransferInfo?.find(
      (t: any) => t.symbol === 'USDT' && t.to_address === USDT_WALLET
    )
    if (!transfer) throw new Error('Перевод USDT на наш кошелек не найден')

    // 4. Проверяем сумму
    const amounts = { standard: 10000000, prime: 50000000, legacy: 100000000 }
    const expectedAmount = amounts[tier as keyof typeof amounts]
    if (parseInt(transfer.amount_str, 10) < expectedAmount) {
      throw new Error('Сумма транзакции меньше требуемой')
    }

    // 5. Сохраняем в базу
    const { data, error } = await supabase.from('flags').insert({
      url: userUrl,
      image_url: imageUrl,
      lat, lon, tier,
      tx_hash: txHash
    }).select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, flag: data[0] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})