'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCard, Smartphone, Receipt, DollarSign, Check, X, Clock,
  ArrowLeft, Shield, Lock, Info, AlertCircle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { mockAPI } from '@/lib/mock-data'
import { Event } from '@/lib/types'

// Cartões de teste
const testCards = {
  success: {
    number: '4111 1111 1111 1111',
    name: 'VISA - Sucesso',
    cvv: '123',
    expiry: '12/25'
  },
  pending: {
    number: '5555 5555 5555 4444',
    name: 'MASTERCARD - Pendente',
    cvv: '456',
    expiry: '10/26'
  },
  error: {
    number: '4000 0000 0000 0002',
    name: 'VISA - Erro',
    cvv: '789',
    expiry: '08/24'
  }
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    pixKey: '',
    boleto: {
      cpf: '',
      name: '',
      email: ''
    },
    paypal: {
      email: ''
    }
  })

  useEffect(() => {
    if (eventId) {
      loadEventDetails()
    } else {
      router.push('/')
    }
  }, [eventId, router])

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      const eventData = await mockAPI.getEvent(eventId!)
      if (!eventData) {
        toast.error('Evento não encontrado')
        router.push('/')
        return
      }
      setEvent(eventData)
    } catch (error) {
      toast.error('Erro ao carregar dados do evento')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value
      }
    }))
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 5)
  }

  const useTestCard = (cardType: keyof typeof testCards) => {
    const card = testCards[cardType]
    setFormData(prev => ({
      ...prev,
      cardNumber: card.number,
      cardName: card.name,
      expiryDate: card.expiry,
      cvv: card.cvv
    }))
    toast.info(`Cartão de teste ${cardType} preenchido automaticamente`)
  }

  const simulatePayment = async (): Promise<'success' | 'pending' | 'error'> => {
    // Simular baseado no número do cartão
    const cardNumber = formData.cardNumber.replace(/\s/g, '')
    
    if (cardNumber === '4111111111111111') return 'success'
    if (cardNumber === '5555555555554444') return 'pending'
    if (cardNumber === '4000000000000002') return 'error'
    
    // Para outros métodos, simular sucesso
    if (paymentMethod !== 'credit_card' && paymentMethod !== 'debit_card') {
      return 'success'
    }
    
    // Simular resultados aleatórios para outros cartões
    const outcomes: ('success' | 'pending' | 'error')[] = ['success', 'success', 'success', 'pending', 'error']
    return outcomes[Math.floor(Math.random() * outcomes.length)]
  }

  const handlePayment = async () => {
    if (!event) return

    try {
      setProcessing(true)
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = await simulatePayment()
      
      if (result === 'success') {
        // Registrar no evento
        await mockAPI.registerForEvent(eventId!, 'PAID')
        toast.success('Pagamento aprovado! Você foi inscrito no evento.')
        router.push(`/event/${eventId}?payment=success`)
      } else if (result === 'pending') {
        // Registrar no evento mas com pagamento pendente
        await mockAPI.registerForEvent(eventId!, 'PENDING')
        toast.warning('Pagamento em análise. Você receberá a confirmação em breve.')
        router.push(`/event/${eventId}?payment=pending`)
      } else {
        toast.error('Pagamento recusado. Tente novamente com outro cartão.')
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento')
    } finally {
      setProcessing(false)
    }
  }

  const validateForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv
      case 'pix':
        return formData.pixKey
      case 'boleto':
        return formData.boleto.cpf && formData.boleto.name && formData.boleto.email
      case 'paypal':
        return formData.paypal.email
      default:
        return true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Evento não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Pagamento Seguro</span>
                  </CardTitle>
                  <CardDescription>
                    Escolha a forma de pagamento e complete sua inscrição
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div>
                    <Label className="text-base font-medium">Método de Pagamento</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex items-center space-x-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <span>Cartão de Crédito</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="debit_card" id="debit_card" />
                        <Label htmlFor="debit_card" className="flex items-center space-x-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <span>Cartão de Débito</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex items-center space-x-2 cursor-pointer">
                          <Smartphone className="h-4 w-4" />
                          <span>PIX</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto" className="flex items-center space-x-2 cursor-pointer">
                          <Receipt className="h-4 w-4" />
                          <span>Boleto Bancário</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center space-x-2 cursor-pointer">
                          <DollarSign className="h-4 w-4" />
                          <span>PayPal</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Card Payment */}
                  {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Dados do Cartão</h3>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => useTestCard('success')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Sucesso
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => useTestCard('pending')}
                          >
                            <Clock className="h-3 w-3 mr-1 text-yellow-600" />
                            Pendente
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => useTestCard('error')}
                          >
                            <X className="h-3 w-3 mr-1 text-red-600" />
                            Erro
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="cardNumber">Número do Cartão</Label>
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cardName">Nome no Cartão</Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                            placeholder="NOME COMO NO CARTÃO"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Validade</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIX Payment */}
                  {paymentMethod === 'pix' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pagamento via PIX</h3>
                      <div>
                        <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
                        <Input
                          id="pixKey"
                          value={formData.pixKey}
                          onChange={(e) => handleInputChange('pixKey', e.target.value)}
                          placeholder="email@exemplo.com ou CPF"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Após confirmar, você receberá o QR Code para pagamento
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Boleto Payment */}
                  {paymentMethod === 'boleto' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dados para Boleto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="boletoCpf">CPF</Label>
                          <Input
                            id="boletoCpf"
                            value={formData.boleto.cpf}
                            onChange={(e) => handleNestedInputChange('boleto', 'cpf', e.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="boletoName">Nome Completo</Label>
                          <Input
                            id="boletoName"
                            value={formData.boleto.name}
                            onChange={(e) => handleNestedInputChange('boleto', 'name', e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="boletoEmail">Email</Label>
                          <Input
                            id="boletoEmail"
                            type="email"
                            value={formData.boleto.email}
                            onChange={(e) => handleNestedInputChange('boleto', 'email', e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Payment */}
                  {paymentMethod === 'paypal' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">PayPal</h3>
                      <div>
                        <Label htmlFor="paypalEmail">Email do PayPal</Label>
                        <Input
                          id="paypalEmail"
                          type="email"
                          value={formData.paypal.email}
                          onChange={(e) => handleNestedInputChange('paypal', 'email', e.target.value)}
                          placeholder="email@paypal.com"
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button 
                    onClick={handlePayment}
                    disabled={processing || !validateForm()}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Confirmar Pagamento - R$ {event.price.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Transação segura</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Dados protegidos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded bg-gradient-to-br"
                        style={{
                          background: `linear-gradient(135deg, ${event.category?.color || '#6366f1'}, ${event.category?.color || '#8b5cf6'})`
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <p className="text-xs text-gray-600">{event.location}</p>
                      <Badge variant="outline" className="mt-1">
                        {event.category?.name}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Inscrição no evento</span>
                      <span>R$ {event.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de processamento</span>
                      <span>R$ 0,00</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>R$ {event.price.toFixed(2)}</span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Cartões de teste:</p>
                        <p>• 4111 1111 1111 1111 - Sucesso</p>
                        <p>• 5555 5555 5555 4444 - Pendente</p>
                        <p>• 4000 0000 0000 0002 - Erro</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando informações de pagamento...</p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  )
} 