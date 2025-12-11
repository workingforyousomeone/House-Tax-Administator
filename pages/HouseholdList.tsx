
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHouseholdsByCluster, getClusterById } from '../services/data';

export const HouseholdList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cluster = getClusterById(id || '');
  const households = getHouseholdsByCluster(id || '');

  if (!cluster) return <div className="p-8 text-center text-white font-medium">Cluster not found</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-white/20 backdrop-blur-md border-b border-white/20 sticky top-0 z-10 shadow-sm">
          <p className="text-slate-800 text-sm font-bold">{households.length} Households in {cluster.name}</p>
      </div>

      <div className="p-3 space-y-2">
        {households.map((h) => {
          const pending = h.totalDemand - h.totalCollected;
          const progress = h.totalDemand > 0 ? Math.min(100, Math.round((h.totalCollected / h.totalDemand) * 100)) : 0;
          
          return (
            <div 
              key={h.id}
              onClick={() => navigate(`/household/${h.id}`)}
              className="bg-white/40 backdrop-blur-md rounded-xl p-2.5 shadow-sm border border-white/40 active:bg-white/60 transition-colors cursor-pointer"
            >
              {/* Header: Owner Name & Assessment Number inline */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-900 text-sm truncate pr-2 flex-1">{h.ownerName}</h3>
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap shrink-0">
                   #{h.assessmentNumber}
                </span>
              </div>

              {/* Stats - Simple Labels (No boxes) */}
              <div className="flex justify-between items-end text-xs mb-1.5 px-0.5">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-slate-500 font-bold">Demand</span>
                  <span className="font-bold text-slate-800">₹{h.totalDemand}</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="text-[8px] uppercase text-green-700 font-bold">Collected</span>
                  <span className="font-bold text-green-700">₹{h.totalCollected}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] uppercase text-red-600 font-bold">Pending</span>
                  <span className="font-bold text-red-600">₹{pending}</span>
                </div>
              </div>

              {/* Progress Bar - Thinner */}
              <div className="w-full bg-white/50 h-1 rounded-full overflow-hidden shadow-inner border border-white/20">
                <div 
                  className={`h-full rounded-full shadow-sm ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
