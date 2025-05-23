
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SubjectIcon, getSubjectName } from "@/components/SubjectIcons";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import duration from "dayjs/plugin/duration";
import { useEffect, useState } from "react";
import { ExamWeek as ExamWeekType, Exam } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

dayjs.extend(duration);
dayjs.locale("ar");

interface ExamWeekProps {
  week: ExamWeekType;
  exams: Exam[];
  onDelete?: (id: number) => void;
}

const ExamWeek: React.FC<ExamWeekProps> = ({ week, exams, onDelete }) => {
  const { isAdmin } = useAuth();
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});

  const calculateRemainingTime = (date: string) => {
    const examDate = dayjs(date).hour(3); // تعيين وقت الامتحان إلى 3 صباحاً
    const now = dayjs();
    const diff = examDate.diff(now);
    
    if (diff <= 0) return "انتهى الوقت";
    
    const duration = dayjs.duration(diff);
    const days = Math.floor(duration.asDays());
    
    if (days > 0) {
      return `${days} يوم${days > 1 ? '' : ''}`;
    }
    
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const updateTimes = () => {
      const times: { [key: string]: string } = {};
      exams.forEach(exam => {
        times[exam.id] = calculateRemainingTime(exam.date);
      });
      setRemainingTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [exams]);

  // ترتيب الاختبارات حسب التاريخ
  const sortedExams = [...exams].sort((a, b) => 
    dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  );

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-right border-b">
              <th className="pb-2">المادة</th>
              <th className="pb-2">اليوم</th>
              <th className="pb-2">التاريخ</th>
              <th className="pb-2">المتبقي</th>
              <th className="pb-2">الدروس المقررة</th>
              {isAdmin && <th className="pb-2"></th>}
            </tr>
          </thead>
          <tbody>
            {sortedExams.map(exam => (
              <tr key={exam.id} className="border-b last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <SubjectIcon subject={exam.subject} className="h-5 w-5" />
                    <span>{getSubjectName(exam.subject)}</span>
                  </div>
                </td>
                <td className="py-3">{exam.day}</td>
                <td className="py-3">{dayjs(exam.date).format("DD/MM/YYYY")}</td>
                <td className="py-3" dir="ltr">{remainingTimes[exam.id]}</td>
                <td className="py-3">
                  <ul className="list-disc list-inside">
                    {exam.topics.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </td>
                {isAdmin && (
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(exam.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ExamWeek;
