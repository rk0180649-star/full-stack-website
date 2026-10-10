"use client"
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from 'next/link';
import { ArrowUpRight, MapPin, Banknote, Calendar, ChevronRight } from 'lucide-react';
import axios from "axios";
import { useTranslation } from 'react-i18next';// for lamguage tranlate


export default function Hero() {
  const categories = [
    "Big Brands",
    "Work From Home",
    "Part-time",
    "MBA",
    "Engineering",
    "Media",
    "Design",
    "Data Science",
  ];

  const slides = [
  {
    pattern: "pattern-1",
    titleKey: "start_career",
    bgColor: "bg-indigo-600",
  },
  {
    pattern: "pattern-2",
    titleKey: "learn_best",
    bgColor: "bg-blue-600",
  },
  {
    pattern: "pattern-3",
    titleKey: "grow_skills",
    bgColor: "bg-purple-600",
  },
  {
    pattern: "pattern-4",
    titleKey: "connect_companies",
    bgColor: "bg-teal-600",
  },
];
 const stats = [
    { number: "300K+", label: "companies hiring" },
    { number: "10K+", label: "new openings everyday" },
    { number: "21Mn+", label: "active students" },
    { number: "600K+", label: "learners" },
 ];


  // Community Feed Section 
  const [showStickyBar, setShowStickyBar] = useState(false);
  const lastScrollY = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
        const handleScroll = () => {
          const currentScrollY = window.scrollY;
          // Niche scroll karne par show, upar scroll karne par hide
          if (currentScrollY > 150 && currentScrollY > lastScrollY.current) {
            setShowStickyBar(true);
          } else {
            setShowStickyBar(false);
          }
          lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);

      const scrollToFeed = () => {
     feedRef.current?.scrollIntoView({ behavior: "smooth" });
  };// feed over here 



  const [internships, setinternship] = useState<any>([]);
  const [jobs, setjob] = useState<any>([]);
  useEffect(()=>{
          const fetchdata = async () =>{
            try{
              const [internshipres, jobres]=await Promise.all([
                axios.get("https://full-stack-website-h8ju.onrender.com/api/internship"),
                axios.get("https://full-stack-website-h8ju.onrender.com/api/job")
              ]);
              setinternship(internshipres.data);
             setjob(jobres.data);
            }catch(error){
            console.log(error);
          }
        }
    fetchdata()
  },[]);


  const [selectedCategory, setSelectedCategory] = useState("");
  const filteredInternships = internships.filter((item: any) => !selectedCategory || item.category === selectedCategory);
  const filteredJobs = jobs.filter((item: any) =>!selectedCategory || item.category === selectedCategory);


  //language translate 
  const { t } = useTranslation();// for lamguage tranlate
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
  setMounted(true);
  }, []);
    // Jab tak browser render na ho, mismatch text ko hide rakhega
  if (!mounted) {
  return null;
  }

return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t("hero_title")}
              </h1>
              <p className="text-xl text-gray-600">{t("trending_on")}</p>
            </div>
            {/* plan */}
            <div>
              <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white py-12 px-6 rounded-2xl mx-auto max-w-6xl my-8 text-center shadow-lg">
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-400/30">
                  {t("supercharge_career")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
                 {t("unlock_premium_title")}
                </h2>
                <p className="mt-3 text-base sm:text-lg text-gray-200 max-w-2xl mx-auto">
                  {t("unlock_premium_desc")}
                </p>
                
                <div className="mt-6 flex justify-center gap-4">
                  <Link 
                    href="/pages/pricing" 
                    className="bg-white text-blue-900 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                  >
                    {t("view_plans_pricing")}
                  </Link>
                </div>
              </div>
          </div>

             {/* swiper section */}
            <div className="mb-16">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className={`relative h-[400px] ${slide.bgColor}`}>
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {slide.pattern === "pattern-1" && (
                        <pattern
                          id="pattern-1"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="10" cy="10" r="3" fill="white" />
                        </pattern>
                      )}
                      {slide.pattern === "pattern-2" && (
                        <pattern
                          id="pattern-2"
                          x="0"
                          y="0"
                          width="40"
                          height="40"
                          patternUnits="userSpaceOnUse"
                        >
                          <rect x="15" y="15" width="10" height="10" fill="white" />
                        </pattern>
                      )}
                      {slide.pattern === "pattern-3" && (
                        <pattern
                          id="pattern-3"
                          x="0"
                          y="0"
                          width="40"
                          height="40"
                          patternUnits="userSpaceOnUse"
                        >
                          <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="white" />
                        </pattern>
                      )}
                      {slide.pattern === "pattern-4" && (
                        <pattern
                          id="pattern-4"
                          x="0"
                          y="0"
                          width="60"
                          height="60"
                          patternUnits="userSpaceOnUse"
                        >
                          <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="white" />
                        </pattern>
                      )}
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill={`url(#${slide.pattern})`}
                      />
                    </svg>
                  </div>

                  {/* Content: Title dynamically translate hoga */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-4xl font-bold text-white" suppressHydrationWarning>
                      {t(slide.titleKey)}
                    </h2>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Category section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("latest_internships")}
          </h2>

          <div className="flex flex-wrap gap-4">
            {/* 1. POPULAR CATEGORIES text translate */}
            <span className="text-gray-700 font-medium">
              {t("popular_categories")}:
            </span>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {/* 2. Button ka text dynamically translate karein */}
                {t(`category_${category.toLowerCase().replace(/\s+/g, '_')}`)}
              </button>
            ))}
          </div>
        </div>

      {/* Internship grid */}
        <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("latest_internships")}
          
        </h2>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredInternships.map((internship:any, index:any) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ArrowUpRight size={20} />
              <span className="font-medium">{t("actively_hiring")}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{internship.title}</h3>
            <p className="text-gray-500 mb-4">{internship.company}</p>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{internship.stipend}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{internship.StartDate}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {t("internship")}
              </span>
              <Link
                href={`/pages/detailinternship/${internship._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                  {t("view_details")}
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        </div>

        {/* Jobs grid */}
        <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("latest_jobs")}
        </h2>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredJobs.map((job:any, index:any) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ArrowUpRight size={20} />
              <span className="font-medium">{t("actively_hiring")}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{job.title}</h3>
            <p className="text-gray-500 mb-4">{job.company}</p>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{job.CTC}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{job.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {t("job")}
              </span>
              <Link
                href={`/pages/detailjob/${job._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {t("view_details")}
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Stat Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
        {/* Community Feed Section */}
        <div 
          ref={feedRef} 
          id="community-feed" 
          className="bg-white rounded-2xl shadow-sm sm:shadow-lg p-4 sm:p-8 mb-12 sm:mb-16 border border-gray-100"
        >
          {/* Header Section: Mobile pe Stack (col), Tablet/Desktop pe Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-4 mb-5 border-b border-gray-100">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🌐</span>
                <span className="truncate">{t("community_feed_title")}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-snug">
                {t("community_feed_desc")}
              </p>
            </div>

            <Link
              href="/pages/feed"
              className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 sm:py-2 rounded-xl transition shadow-xs shrink-0"
            >
            {t("open_full_feed")}
            </Link>
          </div>

          {/* Quick Feed Card */}
          <div className="bg-slate-50/80 border border-dashed border-gray-300 rounded-xl p-5 sm:p-8 text-center">
            <p className="text-sm sm:text-base font-semibold text-gray-800">
              {t("connect_peers_title")}
            </p>
            <p className="text-xs text-gray-500 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
              {t("connect_peers_desc")}
            </p>

            {/* Action Buttons: Mobile pe 50-50 equal width */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs mx-auto">
              <Link
                href="/pages/createpost"
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium py-2.5 px-3 rounded-xl transition text-center shadow-2xs whitespace-nowrap"
              >
                {t("create_post")}
              </Link>
              <Link
                href="/pages/feed"
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-medium py-2.5 px-3 rounded-xl transition text-center shadow-xs whitespace-nowrap"
              >
                {t("explore_feed")}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Sticky Bar: Mobile & Desktop Optimized */}
        <div
          className={`fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out w-[92%] sm:w-auto max-w-sm ${
            showStickyBar 
              ? "translate-y-0 opacity-100 scale-100 pointer-events-auto" 
              : "translate-y-16 opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 shadow-2xl rounded-full px-3.5 py-1.5 flex items-center justify-between sm:justify-start gap-2.5">
            <span className="text-xs font-medium text-slate-300 truncate">
              🔥 Latest Discussions
            </span>
            <button
              type="button"
              onClick={scrollToFeed}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
            >
              <span>Explore</span>
              <span className="text-xs">↓</span>
            </button>
          </div>
        </div>
  </div>
);
}

