"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Users, Heart, Globe, Plane, Calendar, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useEffect, useState } from "react"

export default function FlightSearchSite() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const heroImages = ["/images/hero-bg-1.jpeg", "/images/hero-bg-2.jpeg", "/images/hero-bg-3.jpeg"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Troca a imagem a cada 5 segundos

    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">SemViagem</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#buscar" className="text-gray-600 hover:text-blue-600 transition-colors">
                Buscar
              </a>
              <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sobre Nós
              </a>
              <a href="#impacto" className="text-gray-600 hover:text-blue-600 transition-colors">
                Impacto Social
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contato
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost">Entrar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Cadastrar-se</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Hero background ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        {/* Content */}
        <div className="container mx-auto relative z-20">
          <div className="flex justify-center items-center">
            <div className="text-center max-w-4xl">
              <Badge variant="outline" className="mb-6 text-blue-400 border-blue-400 bg-white/10 backdrop-blur-sm">
                Revolucionando o modo de viajar
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                O mundo é de todos.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Viaje pagando o justo!
                </span>
              </h1>
              <p className="text-lg text-gray-200 mb-8 mx-auto">
                SemViagem, sem truques, sem tarifas escondidas. Nosso propósito é simples: democratizar viagens, com
                transparência total, preço honesto e impacto social positivo para todos os brasileiros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Passagens
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Conheça Nossa Missão
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="buscar" className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Encontre Sua Próxima Aventura</h2>
            <p className="text-xl text-gray-600">Busque passagens com transparência total e preços justos</p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Origem</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="São Paulo, SP" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Destino</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Rio de Janeiro, RJ" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ida</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="date" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Volta</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="date" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Passageiros</label>
                  <Input placeholder="1 adulto" />
                </div>
                <Link href="/flights">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 mt-6 sm:mt-0">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Voos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pro Account Section */}
      <section id="pro" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  <Sparkles className="h-8 w-8 text-yellow-400 mr-3" />
                  Conta PRO SemViagem
                </h2>
                <div className="text-gray-300 mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Assine a Conta PRO – R$29,99/mês</h3>
                  <p className="mb-4">Apoie o desenvolvimento do SemViagem e desbloqueie benefícios exclusivos:</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Resultados ilimitados durante o ano inteiro
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Alertas inteligentes por IA (WhatsApp, Push, E-mail)
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Acesso antecipado a promoções e tarifas especiais
                    </li>
                  </ul>
                </div>
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold">
                  Tornar-se PRO
                </Button>
              </div>
              <div className="hidden md:block relative h-full">
                <Image
                  src="https://toogood.tech/wp-content/uploads/2025/08/semviagem_plano_pro_classe_executiva.png"
                  alt="SemViagem Pro Account - Classe Executiva"
                  layout="fill"
                  objectFit="cover"
                  className="opacity-90"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Modelo de Negócio Section */}
      <section id="sobre" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Economia de Valor Compartilhado</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Operamos em um modelo revolucionário onde não possuímos um proprietário tradicional ou uma empresa como
              proprietário. Nosso foco é gerar impacto social positivo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Propriedade Coletiva</h3>
                <p className="text-gray-600">
                  Sem proprietários tradicionais. Somos uma comunidade que trabalha em conjunto para democratizar as
                  viagens.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Impacto Social</h3>
                <p className="text-gray-600">
                  Cada viagem contribui para projetos sociais e ambientais, criando um impacto positivo nas comunidades
                  locais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Valor Compartilhado</h3>
                <p className="text-gray-600">
                  Os benefícios são distribuídos entre todos os participantes, garantindo preços justos e experiências
                  autênticas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impacto" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Nosso Impacto Social</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada passagem comprada contribui diretamente para projetos que transformam vidas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Projetos Apoiados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50k+</div>
              <div className="text-gray-600">Vidas Impactadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">R$ 2M+</div>
              <div className="text-gray-600">Investidos em Comunidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">FAQ Atualizado – SemViagem</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre nossa plataforma e serviços</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                O que é a Conta PRO SemViagem?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                É uma assinatura mensal de R$29,99 que dá acesso a resultados ilimitados, alertas inteligentes e
                promoções exclusivas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                Como funciona o SemViagem?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                <p className="mb-3">
                  O SemViagem coleta dados de tráfego aéreo mundial em tempo real e disponibiliza passagens a preços
                  realmente baixos.
                </p>
                <p className="mb-3">
                  Diferente de outros buscadores, não somos financiados por companhias aéreas ou agências — o que nos
                  permite mostrar as tarifas mais transparentes e justas.
                </p>
                <p>
                  Nosso objetivo é simples: fazer com que o maior número possível de brasileiros viaje pelo mundo. Com
                  passagens baratas e acessíveis, isso se torna possível.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                Como cada viagem gera impacto social?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Parte da receita de cada passagem é destinada a projetos sociais e ambientais que apoiamos diretamente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                Quais métodos de pagamento são aceitos?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">Cartões de crédito.</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                Posso cancelar minha assinatura a qualquer momento?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Sim, você pode cancelar diretamente pelo portal do cliente sem multas ou burocracia.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Partners Section */}
      <section id="parceiros" className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <h3 className="text-center text-lg font-semibold text-gray-600 mb-8">
            Trabalhamos com as melhores companhias aéreas para sua experiência
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <Image
              src="/logos/latam.png"
              alt="LATAM"
              width={140}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/azul.png"
              alt="Azul"
              width={100}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/gol.png"
              alt="GOL"
              width={80}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/american-airlines.svg"
              alt="American Airlines"
              width={160}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/tap.png"
              alt="TAP"
              width={100}
              height={40}
              className="grayscale hover:grayscale-0 transition-all object-contain"
            />
            <Image
              src="/logos/copa.png"
              alt="Copa Airlines"
              width={140}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/iberia.png"
              alt="Iberia"
              width={120}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
            <Image
              src="/logos/interline-azul.png"
              alt="Interline Azul"
              width={150}
              height={40}
              className="grayscale hover:grayscale-0 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6" />
                <span className="text-xl font-bold">SemViagem</span>
              </div>
              <p className="text-gray-400">Revolucionando o modo de viajar com impacto social positivo.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#sobre" className="hover:text-white transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#impacto" className="hover:text-white transition-colors">
                    Impacto Social
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#contato" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Conecte-se</h4>
              <p className="text-gray-400 mb-4">Receba novidades sobre nossos projetos sociais</p>
              <div className="flex space-x-2">
                <Input placeholder="Seu e-mail" className="bg-gray-800 border-gray-700" />
                <Button size="sm">Inscrever</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SemViagem. Todos os direitos reservados. sucessodocliente@semviagem.com</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
