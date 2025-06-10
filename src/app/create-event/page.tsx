'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarPlus, MapPin, Users, DollarSign, Clock, FileText, Shield, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagInput } from '@/components/ui/tag-input'
import { toast } from 'sonner'

interface EventCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    maxParticipants: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    latitude: '',
    longitude: ''
  })
  const [imagePreview, setImagePreview] = useState<string>('')

  // Verificar autenticação e permissões
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user?.role !== 'ADMIN') {
      router.push('/')
      toast.error('Apenas admins podem criar eventos')
      return
    }
    
    loadCategories()
  }, [session, status, router])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categoriesData = await response.json()
        setCategories(categoriesData)
      } else {
        toast.error('Erro ao carregar categorias')
      }
    } catch (error) {
      toast.error('Erro ao carregar categorias')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.location || 
        !formData.date || !formData.time || !formData.maxParticipants || !formData.categoryId) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return false
    }

    // Validar data não pode ser no passado
    const startDateTime = new Date(`${formData.date}T${formData.time}`)
    if (startDateTime < new Date()) {
      toast.error('A data e hora do evento devem ser no futuro')
      return false
    }

    // Validar data e hora de término se fornecidas
    if (formData.endDate && formData.endTime) {
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      if (endDateTime <= startDateTime) {
        toast.error('A data e hora de término devem ser posteriores ao início')
        return false
      }
    }

    // Validar capacidade
    if (parseInt(formData.maxParticipants) <= 0) {
      toast.error('A capacidade deve ser maior que zero')
      return false
    }

    // Validar preço
    if (formData.price && parseFloat(formData.price) < 0) {
      toast.error('O preço não pode ser negativo')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      toast.error('Você não tem permissão para criar eventos')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // Preparar dados do evento
      const startDate = new Date(`${formData.date}T${formData.time}`)
      let endDate = startDate
      
      if (formData.endDate && formData.endTime) {
        endDate = new Date(`${formData.endDate}T${formData.endTime}`)
      } else {
        // Se não foi especificada hora de término, assumir 2 horas de duração
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: formData.location,
        address: formData.address || formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        maxParticipants: parseInt(formData.maxParticipants),
        price: parseFloat(formData.price || '0'),
        isPublic: true,
        imageUrl: formData.imageUrl || null,
        organizerId: session.user.id,
        categoryId: formData.categoryId
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        toast.success('Evento criado com sucesso!')
        router.push('/my-events')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar evento')
      }
    } catch (error) {
      toast.error('Erro ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null
  }

  // Access denied for non-admins
  if (session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem criar eventos.
            </CardDescription>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <CalendarPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Evento</h1>
            <p className="text-gray-600">Preencha as informações para criar seu evento</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Evento</CardTitle>
              <CardDescription>
                Todos os campos marcados com * são obrigatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Evento *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Workshop de React"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição do evento"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {/* Imagem do evento */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Imagem do Evento</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                        onError={() => {
                          setImagePreview('')
                          setFormData(prev => ({ ...prev, imageUrl: '' }))
                          toast.error('URL da imagem inválida')
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview('')
                          setFormData(prev => ({ ...prev, imageUrl: '' }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Localização */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Localização
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Local *</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Centro de Convenções Anhembi"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Input
                        id="address"
                        placeholder="Rua, número, bairro, cidade"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (opcional)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="-23.5505"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (opcional)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="-46.6333"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Data e Hora
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data de Início *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora de Início *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data de Término (opcional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.date}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Hora de Término (opcional)</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Se não especificar o término, será assumido 2 horas de duração
                  </p>
                </div>

                {/* Capacidade e Preço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Capacidade e Preço
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Capacidade Máxima *</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        Deixe em branco ou 0 para evento gratuito
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/my-events')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Criar Evento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 