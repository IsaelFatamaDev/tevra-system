import HeroSection from '../components/HeroSection'
import TrustBar from '../components/TrustBar'
import HowItWorksSection from '../components/HowItWorksSection'
import CategoriesGrid from '../components/CategoriesGrid'
import SocialProof from '../components/SocialProof'
import TeVraReviews from '../components/TeVraReviews'
import FinalCTA from '../components/FinalCTA'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <CategoriesGrid />
      <SocialProof />
      <TeVraReviews />
      <FinalCTA />
    </main>
  )
}
