'use client'

import { useState, useEffect } from 'react'
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
import { useRouter } from 'next/navigation'
import { mockAPI, mockUser } from '@/lib/mock-data'
import { EventCategory } from '@/lib/types'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    location: '',
    address: '',
    date: '',
    time: '',
    endTime: '',
    capacity: '',
    price: '',
    categoryId: '',
    tags: [] as string[],
    requirements: '',
    imageUrl: ''
  })
  const [imagePreview, setImagePreview] = useState<string>('')

  // Verificar se o usuário tem permissão para criar eventos
  useEffect(() => {
    if (mockUser.role !== 'ORGANIZER' && mockUser.role !== 'ADMIN') {
      // Redirecionar se não for organizador
      router.push('/')
      toast.error('Apenas organizadores podem criar eventos')
      return
    }
    
    loadCategories()
  }, [router])

  const loadCategories = async () => {
    try {
      const categoriesData = await mockAPI.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      toast.error('Erro ao carregar categorias')
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
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
        !formData.date || !formData.time || !formData.capacity || !formData.categoryId) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return false
    }

    // Validar data não pode ser no passado
    const eventDate = new Date(`${formData.date}T${formData.time}`)
    if (eventDate < new Date()) {
      toast.error('A data e hora do evento devem ser no futuro')
      return false
    }

    // Validar hora de término
    if (formData.endTime) {
      const startTime = formData.time
      const endTime = formData.endTime
      
      // Se for no mesmo dia, hora de término deve ser maior que hora de início
      if (endTime <= startTime) {
        toast.error('A hora de término deve ser maior que a hora de início')
        return false
      }
    }

    // Validar capacidade
    if (parseInt(formData.capacity) <= 0) {
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
    
    if (mockUser.role !== 'ORGANIZER' && mockUser.role !== 'ADMIN') {
      toast.error('Você não tem permissão para criar eventos')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price || '0'),
        tags: formData.tags,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(req => req.trim()) : []
      }

      await mockAPI.createEvent(eventData)
      
      toast.success('Evento criado com sucesso!')
      router.push('/my-events')
    } catch (error) {
      toast.error('Erro ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  // Se não for organizador, mostrar página de acesso negado
  if (mockUser.role !== 'ORGANIZER' && mockUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas organizadores podem criar eventos. Entre em contato conosco para se tornar um organizador.
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
                  <Label htmlFor="description">Descrição Breve *</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descrição do evento (máx. 200 caracteres)"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    rows={2}
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-gray-500">{formData.description.length}/200 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailedDescription">Descrição Detalhada</Label>
                  <Textarea
                    id="detailedDescription"
                    placeholder="Descrição completa do evento, programação, o que está incluso, etc."
                    value={formData.detailedDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('detailedDescription', e.target.value)}
                    rows={4}
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
                  <p className="text-xs text-gray-500">
                    Cole a URL de uma imagem para ser exibida como capa do evento
                  </p>
                </div>

                {/* Localização */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Local *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="Ex: Centro de Convenções SP"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
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

                {/* Data e Hora */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
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
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Término</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="pl-10"
                        min={formData.time}
                      />
                    </div>
                    {formData.time && formData.endTime && formData.endTime <= formData.time && (
                      <p className="text-xs text-red-500">
                        A hora de término deve ser maior que a hora de início
                      </p>
                    )}
                  </div>
                </div>

                {/* Capacidade e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Ex: 100"
                        value={formData.capacity}
                        onChange={(e) => handleInputChange('capacity', e.target.value)}
                        className="pl-10"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00 (gratuito)"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <TagInput
                    value={formData.tags}
                    onChange={(tags) => handleInputChange('tags', tags)}
                    placeholder="Ex: tecnologia, networking, react"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requisitos/Observações</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Ex: Trazer laptop&#10;Conhecimento básico em programação&#10;Documento com foto"
                    value={formData.requirements}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('requirements', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Separe cada requisito em uma linha diferente
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
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
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/')}
                    disabled={loading}
                  >
                    Cancelar
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