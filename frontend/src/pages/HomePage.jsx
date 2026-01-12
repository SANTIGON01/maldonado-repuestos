/**
 * Página Principal - Landing con productos destacados
 */
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Features from '../components/Features'
import CallToAction from '../components/CallToAction'

export default function HomePage({ onQuoteClick }) {
  return (
    <>
      <Hero onQuoteClick={onQuoteClick} />
      <Categories />
      <FeaturedProducts />
      <Features />
      <CallToAction onQuoteClick={onQuoteClick} />
    </>
  )
}

