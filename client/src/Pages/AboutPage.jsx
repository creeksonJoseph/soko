import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About SokoDigital
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              SokoDigital is a platform dedicated to connecting talented local
              artisans with buyers who appreciate unique, handcrafted goods.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 mb-6">
              We believe in preserving traditional craftsmanship while providing
              artisans with modern tools to showcase and sell their work. Our
              platform empowers creators to reach a wider audience and build
              sustainable businesses.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              For Artisans
            </h2>
            <p className="text-gray-600 mb-6">
              Create your profile, upload your masterpieces, and connect
              directly with buyers who value authentic, handmade products. We
              handle the technology so you can focus on your craft.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              For Buyers
            </h2>
            <p className="text-gray-600 mb-6">
              Discover one-of-a-kind pieces created by skilled artisans in your
              community. Each purchase supports local talent and helps preserve
              traditional crafts for future generations.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;