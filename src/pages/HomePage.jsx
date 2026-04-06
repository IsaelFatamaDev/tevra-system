import HeroSection from '../components/home/HeroSection'
import TrustBar from '../components/home/TrustBar'
import StepsSection from '../components/home/StepsSection'
import CategoriesGrid from '../components/home/CategoriesGrid'
import SocialProof from '../components/home/SocialProof'
import FinalCTA from '../components/home/FinalCTA'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <StepsSection />
      <CategoriesGrid />
      <SocialProof />
      <FinalCTA />
    </main>
  )
}
