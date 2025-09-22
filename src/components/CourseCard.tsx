import { Star, Users, Clock, BookOpen, Play, Award, TrendingUp, MessageCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id?: number | string;
  title: string;
  instructor: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  category: string;
  level: string;
  progress?: number;
  grade?: string;
  groupLink?: string;
  groupType?: 'whatsapp' | 'telegram';
  teacherImage?: string;
}

export function CourseCard({
  id,
  title,
  instructor,
  image,
  duration,
  students,
  rating,
  price,
  category,
  level,
  progress = 0,
  grade,
  groupLink,
  groupType,
  teacherImage
}: CourseCardProps) {
  const navigate = useNavigate();

  const getLevelColor = (level: string) => {
    switch (level) {
      case "مبتدئ": return "bg-green-500";
      case "متوسط": return "bg-yellow-500";
      case "متقدم": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "علوم": return "bg-blue-500";
      case "لغات": return "bg-purple-500";
      case "رياضيات": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="course-card group cursor-pointer overflow-hidden border-2 hover:border-primary/30 transition-all duration-500">
      <div className="relative overflow-hidden">
        {/* Course Image */}
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/api/placeholder/400/250";
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>

          {/* Category Badge */}
          <Badge 
            className={`absolute top-4 right-4 ${getCategoryColor(category)} text-white border-none font-arabic px-3 py-1`}
          >
            {category}
          </Badge>

          {/* Grade Badge */}
          {grade && (
            <Badge 
              variant="secondary"
              className="absolute top-4 left-4 bg-white/90 text-foreground border-none font-arabic px-3 py-1"
            >
              {grade}
            </Badge>
          )}

          {/* Progress Bar (if exists) */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex justify-between text-white text-sm mb-2">
                  <span className="font-arabic">التقدم</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="bg-white/20" />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Course Title */}
          <h3 className="text-xl font-bold mb-3 font-arabic line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            {teacherImage ? (
              <img
                src={teacherImage}
                alt={instructor}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/40/40";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-muted-foreground font-arabic font-medium">{instructor}</p>
              <p className="text-xs text-muted-foreground font-arabic">مدرس متخصص</p>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-arabic">{duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-arabic">{students.toLocaleString()} طالب</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-bold">{rating}</span>
            <span className="text-sm text-muted-foreground font-arabic">({students} تقييم)</span>
          </div>

          {/* Level and Price */}
          <div className="flex items-center justify-between mb-6">
            <Badge 
              className={`${getLevelColor(level)} text-white border-none font-arabic px-3 py-1`}
            >
              {level}
            </Badge>
            <div className="text-left">
              <span className="text-2xl font-bold text-primary">{price}</span>
              <span className="text-sm text-muted-foreground font-arabic mr-1">ج.م</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                className="flex-1 btn-primary font-arabic group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/course/${id || 1}`);
                }}
              >
                <BookOpen className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                {progress > 0 ? "متابعة التعلم" : "ابدأ التعلم"}
              </Button>

              {progress === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist functionality
                  }}
                >
                  <Star className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Group Link Button */}
            {groupLink && (
              <Button
                variant="outline"
                size="sm"
                className="w-full font-arabic hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-300 group/group"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(groupLink, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4 ml-2 group-hover/group:scale-110 transition-transform" />
                {groupType === 'whatsapp' ? 'انضم لجروب الواتساب' : 'انضم لقناة التليجرام'}
                <ExternalLink className="w-3 h-3 mr-2 opacity-60" />
              </Button>
            )}
          </div>

          {/* Quick Stats (on hover) */}
          <div className="mt-4 pt-4 border-t border-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-primary">85%</div>
                <div className="text-xs text-muted-foreground font-arabic">إكمال</div>
              </div>
              <div>
                <div className="text-sm font-bold text-success">4.8</div>
                <div className="text-xs text-muted-foreground font-arabic">تقييم</div>
              </div>
              <div>
                <div className="text-sm font-bold text-warning">12</div>
                <div className="text-xs text-muted-foreground font-arabic">درس</div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
