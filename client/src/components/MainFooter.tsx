import { Hero } from './home/Hero';

export const MainFooter = () => {
  return (
    <div className="flex flex-col">
      {/* CTA Section */}
      <section className="bg-[#5537ee] py-16 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h3>
        <Hero />
      </section>

      {/* Bottom Footer */}
      <footer className="bg-slate-900 text-white py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Trip Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
};
