import React from 'react';
import { 
  Target, 
  Mail, 
  HelpCircle, 
  Lightbulb,
  Shield,
  Clock,
  Brain,
  TrendingUp,
  BarChart,
  BookOpen
} from 'lucide-react';
import { getTranslation } from '../../utils/translations';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

const Info = ({ language = 'el' }) => {
  const t = translations[language];

  const translations = {
    el: {
      title: 'Σχετικά με το Goal Tracker',
      about: {
        title: 'Τι είναι το Goal Tracker;',
        content: 'Το Goal Tracker είναι μια εφαρμογή σχεδιασμένη για να σας βοηθήσει να παρακολουθείτε και να πετύχετε τους προσωπικούς και επαγγελματικούς σας στόχους. Μέσω της συστηματικής καταγραφής και παρακολούθησης των στόχων σας, μπορείτε να βελτιώσετε την παραγωγικότητα και την προσωπική σας ανάπτυξη.'
      },
      benefits: {
        title: 'Οφέλη',
        list: [
          'Καλύτερη οργάνωση στόχων',
          'Παρακολούθηση προόδου',
          'Αυξημένη παραγωγικότητα',
          'Καλύτερη διαχείριση χρόνου',
          'Μεγαλύτερη πιθανότητα επιτυχίας',
          'Κίνητρο και συνέπεια'
        ]
      },
      features: {
        title: 'Χαρακτηριστικά',
        list: [
          'Εύκολη καταχώρηση στόχων',
          'Αναλυτικά στατιστικά',
          'Υπενθυμίσεις προθεσμιών',
          'Καταγραφή προόδου',
          'Κατηγοριοποίηση στόχων',
          'Προτεραιοποίηση εργασιών'
        ]
      },
      howto: {
        title: 'Πώς να χρησιμοποιήσετε την εφαρμογή',
        steps: [
          'Καταχωρήστε έναν νέο στόχο με σαφή περιγραφή',
          'Ορίστε μια ρεαλιστική προθεσμία',
          'Χωρίστε τον στόχο σε μικρότερα βήματα',
          'Παρακολουθήστε την πρόοδό σας τακτικά',
          'Αναλύστε τα στατιστικά σας'
        ]
      },
      contact: {
        title: 'Επικοινωνία',
        email: 'contact.goaltrackerapp@gmail.com',
        message: 'Για οποιαδήποτε απορία ή πρόταση, μη διστάσετε να επικοινωνήσετε μαζί μας.'
      }
    },
    en: {
      title: 'About Goal Tracker',
      about: {
        title: 'What is Goal Tracker?',
        content: 'Goal Tracker is an application designed to help you track and achieve your personal and professional goals. Through systematic goal tracking and monitoring, you can improve your productivity and personal development.'
      },
      benefits: {
        title: 'Benefits',
        list: [
          'Better goal organization',
          'Progress tracking',
          'Increased productivity',
          'Better time management',
          'Higher success rate',
          'Motivation and consistency'
        ]
      },
      features: {
        title: 'Features',
        list: [
          'Easy goal entry',
          'Detailed statistics',
          'Deadline reminders',
          'Progress tracking',
          'Goal categorization',
          'Task prioritization'
        ]
      },
      howto: {
        title: 'How to Use the App',
        steps: [
          'Enter a new goal with a clear description',
          'Set a realistic deadline',
          'Break down the goal into smaller steps',
          'Track your progress regularly',
          'Analyze your statistics'
        ]
      },
      contact: {
        title: 'Contact',
        email: 'contact.goaltrackerapp@gmail.com',
        message: 'For any questions or suggestions, please don\'t hesitate to contact us.'
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="text-center">
        <h1 className="text-2xl font-semibold mb-4">{t.title}</h1>
      </header>

      {/* About */}
      <GlassmorphicContainer className="rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-300" />
          <h2 className="text-xl font-medium">{t.about.title}</h2>
        </div>
        <p className="text-white/80 leading-relaxed">
          {t.about.content}
        </p>
      </GlassmorphicContainer>

      {/* Benefits */}
      <GlassmorphicContainer className="rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-300" />
          <h2 className="text-xl font-medium">{t.benefits.title}</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.benefits.list.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {benefit}
            </li>
          ))}
        </ul>
      </GlassmorphicContainer>

      {/* Features */}
      <GlassmorphicContainer className="rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-300" />
          <h2 className="text-xl font-medium">{t.features.title}</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.features.list.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              {feature}
            </li>
          ))}
        </ul>
      </GlassmorphicContainer>

      {/* How to Use */}
      <GlassmorphicContainer className="rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-300" />
          <h2 className="text-xl font-medium">{t.howto.title}</h2>
        </div>
        <ul className="space-y-3">
          {t.howto.steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 text-white/80">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                {index + 1}
              </div>
              {step}
            </li>
          ))}
        </ul>
      </GlassmorphicContainer>

      {/* Contact */}
      <GlassmorphicContainer className="rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-pink-300" />
          <h2 className="text-xl font-medium">{t.contact.title}</h2>
        </div>
        <p className="text-white/80 mb-4">{t.contact.message}</p>
        <a 
          href={`mailto:${t.contact.email}`}
          className="text-white/90 hover:text-white underline flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          {t.contact.email}
        </a>
      </GlassmorphicContainer>

      {/* Last updated */}
      <div className="text-center text-sm text-white/50 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US')}
      </div>
    </div>
  );
};

export default Info;
