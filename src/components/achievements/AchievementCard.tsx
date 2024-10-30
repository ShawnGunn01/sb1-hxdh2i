import React from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';

interface AchievementCardProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  isUnlocked: boolean;
  imageUrl?: string;
  reward?: string;
  unlockedAt?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  progress,
  total,
  isUnlocked,
  imageUrl,
  reward,
  unlockedAt
}) => {
  const progressPercentage = (progress / total) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className={`w-16 h-16 rounded-lg ${!isUnlocked && 'opacity-50 grayscale'}`}
            />
          ) : (
            <Trophy 
              className={`w-16 h-16 ${isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`} 
            />
          )}
          {isUnlocked && (
            <CheckCircle 
              className="absolute -top-2 -right-2 w-6 h-6 text-green-500 bg-white rounded-full" 
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {!isUnlocked && <Lock className="w-5 h-5 text-gray-400" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {reward && (
            <p className="text-sm text-indigo-600 mt-1">
              Reward: {reward}
            </p>
          )}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress} / {total}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          {isUnlocked && unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Unlocked on {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;