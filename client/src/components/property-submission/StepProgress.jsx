import React from 'react';

const STEPS = [
  { number: 1, title: 'Basic Info', short: 'Basics' },
  { number: 2, title: 'Location', short: 'Location' },
  { number: 3, title: 'Specifications', short: 'Specs' },
  { number: 4, title: 'Pricing & Terms', short: 'Pricing' },
  { number: 5, title: 'Property Photos', short: 'Photos' },
  { number: 6, title: 'Review & Submit', short: 'Review' },
];

export default function StepProgress({ currentStep, onStepClick, maxStepReached }) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card">
      {/* Desktop & Tablet Progress Stepper */}
      <nav aria-label="Submission Steps" className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isAccessible = step.number <= (maxStepReached || currentStep);

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick(step.number)}
                className={`flex items-center gap-2.5 text-left transition-all ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-brand-navy text-brand-gold border-2 border-brand-gold scale-105'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                <div className="hidden lg:block">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-brand-navy' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </div>
                </div>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${
                    step.number < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile Step Header */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-navy text-brand-gold font-bold text-xs flex items-center justify-center">
            {currentStep}
          </span>
          <div>
            <div className="text-xs font-bold text-brand-navy">
              {STEPS[currentStep - 1]?.title}
            </div>
            <div className="text-[10px] text-slate-500">Step {currentStep} of 6</div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-brand-gold transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

