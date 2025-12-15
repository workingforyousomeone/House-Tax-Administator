
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClustersForUser } from '../services/data';
import { AuthContext } from '../contexts/AuthContext';

export const Clusters: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const clusters = getClustersForUser(user || undefined);

  return (
    <div className="p-3 space-y-3">
      <div className="space-y-2">
        {clusters.length > 0 ? (
          clusters.map((cluster) => {
            const percent = cluster.totalDemand > 0 
                ? Math.round((cluster.totalCollected / cluster.totalDemand) * 100)
                : 0;
            const pending = cluster.totalDemand - cluster.totalCollected;

            return (
              <div 
                key={cluster.id}
                onClick={() => navigate(`/cluster/${cluster.id}`)}
                className="bg-white/40 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-white/40 active:scale-[0.99] hover:bg-white/50 transition-all cursor-pointer relative"
              >
                {/* Percentage Badge - Absolute Top Right */}
                <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/40 shadow-sm ${percent === 100 ? 'bg-green-200/60 text-green-900' : 'bg-white/50 text-slate-800'}`}>
                   {percent}%
                </div>

                <div className="flex items-center gap-3">
                  {/* Cluster Code Icon Badge */}
                  <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center shrink-0 shadow-sm text-brand-700 font-bold text-sm border border-white/50">
                    {cluster.code}
                  </div>
                  
                  {/* Stats Grid - Parallel to icon */}
                  <div className="flex-1 grid grid-cols-3 gap-1 pr-6">
                      <div className="flex flex-col items-center">
                          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Households</p>
                          <p className="font-bold text-slate-900 text-xs">{cluster.totalHouseholds}</p>
                      </div>
                      <div className="flex flex-col items-center border-l border-slate-300/30">
                          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Demand</p>
                          <p className="font-bold text-slate-900 text-xs">₹{cluster.totalDemand.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-center border-l border-slate-300/30">
                          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Pending</p>
                          <p className="font-bold text-red-700 text-xs">₹{pending.toLocaleString()}</p>
                      </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
           <div className="text-center py-10 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <p className="text-white font-medium">No clusters found.</p>
           </div>
        )}
      </div>
    </div>
  );
};
