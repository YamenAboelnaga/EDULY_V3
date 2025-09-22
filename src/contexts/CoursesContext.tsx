import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  students: number;
  rating: number;
  category: string;
  level: string;
  duration: string;
  image: string;
  status: "active" | "draft" | "archived";
  createdAt: string;
}

interface CoursesContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'students' | 'rating' | 'createdAt'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getActiveCourses: () => Course[];
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

const initialCourses: Course[] = [
  {
    id: "1",
    title: "اللغة العربية والأدب - الصف الثالث الثانوي",
    description: "دورة شاملة في اللغة العربية تغطي النحو والصرف والأدب العربي مع تمارين تطبيقية ونماذج امتحانات",
    instructor: "أحمد محمود",
    price: 199,
    students: 1250,
    rating: 4.8,
    category: "اللغة العربية",
    level: "متقدم",
    duration: "80 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "الرياضيات المتقدمة - الصف الثالث الثانوي",
    description: "حل مسائل الرياضيات المعقدة والاستعداد للامتحانات مع شرح مفصل للمفاهيم الأساسية",
    instructor: "سارة علي",
    price: 249,
    students: 890,
    rating: 4.9,
    category: "الرياضيات",
    level: "متقدم",
    duration: "100 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    title: "الفيزياء التطبيقية - الثاني الثانوي",
    description: "فهم قوانين الفيزياء من خلال التجارب العملية والتطبيقات الحياتية",
    instructor: "محمد حسن",
    price: 299,
    students: 450,
    rating: 4.7,
    category: "الفيزياء",
    level: "متوسط",
    duration: "90 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-02-01"
  },
  {
    id: "4",
    title: "الكيمياء العضوية وغير العضوية",
    description: "تعلم أساسيات الكيمياء مع التركيز على التفاعلات والمعادلات الكيميائية",
    instructor: "فاطمة خالد",
    price: 259,
    students: 670,
    rating: 4.6,
    category: "الكيمياء",
    level: "متوسط",
    duration: "85 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-01-25"
  },
  {
    id: "5",
    title: "الأحياء الجزيئية والخلوية",
    description: "دراسة شاملة لعلم الأحياء تشمل النباتات والحيوانات والجينات",
    instructor: "عمر إبراهيم",
    price: 189,
    students: 320,
    rating: 4.5,
    category: "الأحياء",
    level: "متوسط",
    duration: "75 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-02-05"
  },
  {
    id: "6",
    title: "التاريخ المصري والعالمي",
    description: "رحلة عبر التاريخ من الحضارة الفرعونية إلى العصر الحديث",
    instructor: "نادية حسام",
    price: 169,
    students: 540,
    rating: 4.4,
    category: "التاريخ",
    level: "متوسط",
    duration: "60 ساعة",
    image: "/api/placeholder/300/200",
    status: "active",
    createdAt: "2024-01-30"
  }
];

export function CoursesProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => {
    // Try to load from localStorage first
    const savedCourses = localStorage.getItem('eduly_courses');
    return savedCourses ? JSON.parse(savedCourses) : initialCourses;
  });

  // Save to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem('eduly_courses', JSON.stringify(courses));
  }, [courses]);

  const addCourse = (courseData: Omit<Course, 'id' | 'students' | 'rating' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString(),
      students: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCourses(prevCourses => [...prevCourses, newCourse]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === id ? { ...course, ...updates } : course
      )
    );
  };

  const deleteCourse = (id: string) => {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
  };

  const getActiveCourses = () => {
    return courses.filter(course => course.status === 'active');
  };

  const value = {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    getActiveCourses
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
}

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
};
