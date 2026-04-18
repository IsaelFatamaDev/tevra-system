import HeroSection from '../components/HeroSection'
import TrustBar from '../components/TrustBar'
import StepsSection from '../components/StepsSection'
import CategoriesGrid from '../components/CategoriesGrid'
import SocialProof from '../components/SocialProof'
import TeVraReviews from '../components/TeVraReviews'
import FinalCTA from '../components/FinalCTA'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <StepsSection />
      <CategoriesGrid />
      <SocialProof />
      <TeVraReviews />
      <FinalCTA />
    </main>
  )
}
