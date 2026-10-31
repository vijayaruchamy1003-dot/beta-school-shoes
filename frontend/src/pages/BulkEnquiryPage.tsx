import React, { useState } from 'react';
import { bulkEnquiryApi } from '../api/client';
import { Building2, ShieldCheck, Award, CheckCircle2, Phone, Mail } from 'lucide-react';

export const BulkEnquiryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    contactPerson: '',
    phone: '',
    email: '',
    cityState: '',
    estimatedStudents: '',
    shoeModelsRequested: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      await bulkEnquiryApi.submitEnquiry({
        ...formData,
        estimatedStudents: formData.estimatedStudents ? parseInt(formData.estimatedStudents, 10) : undefined
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit enquiry. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Top Header Banner */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Institutional Services
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Bulk School<br />Enquiry
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Direct institutional partnerships for school trusts, principals, and uniform committees. Sizing camps, wholesale tier pricing, and mid-session buffer supplies.
          </p>
        </div>
      </section>

      {/* Main Form & Information Section */}
      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Institutional Benefits (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="paper-shadow border border-foreground/15 bg-card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                  Institutional Benefits
                </h2>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-foreground shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground uppercase text-xs tracking-wider block">Direct Wholesale Tiers:</strong>
                    Substantial institutional price breaks with direct factory dispatch.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-foreground shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground uppercase text-xs tracking-wider block">On-Campus Sizing Squad:</strong>
                    Expert fitting personnel and measurement brannock devices deployed to your school.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground uppercase text-xs tracking-wider block">Mid-Session Buffer Stocks:</strong>
                    Guaranteed 48-hour fulfillment for mid-year admissions and replacement pairs.
                  </div>
                </div>
              </div>

              <div className="border-t border-foreground/15 pt-4 text-xs text-muted-foreground leading-normal">
                * Note: Bulk enquiries capture requirements in PostgreSQL and do not deduct consumer inventory until formal acceptance.
              </div>
            </div>

            {/* Direct Contact Desks */}
            <div className="border border-foreground/15 p-6 bg-secondary/30 space-y-3 text-xs text-muted-foreground">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-foreground block">
                Urgent Admissions Desk
              </span>
              <p>Hotline: <strong className="text-foreground">+91 98450 12345</strong></p>
              <p>Email: <strong className="text-foreground">tenders@apexfootwear.example.com</strong></p>
            </div>
          </div>

          {/* Right Column: Enquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="border border-foreground/25 bg-card p-8 md:p-12 space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-display font-black text-lg">
                  ✓
                </div>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                  Enquiry Successfully Logged
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your bulk institutional requirement has been registered. An institutional accounts manager from Apex Footwear will contact your school administration with a formal proposal and quotation.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        schoolName: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                        cityState: '',
                        estimatedStudents: '',
                        shoeModelsRequested: '',
                        notes: ''
                      });
                    }}
                    className="border-b-2 border-foreground pb-1 text-xs font-bold uppercase tracking-[0.16em] hover:text-muted-foreground transition-colors"
                  >
                    Submit another school enquiry →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                    Submit Institution Proposal
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out your school requirements below for institutional quotation and samples.
                  </p>
                </div>

                {errorMsg && (
                  <div className="border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      School / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. St. Xavier's International School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      Contact Person & Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Principal Mrs. Sharma"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      Official Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      School Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@school.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      City / State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, Karnataka"
                      value={formData.cityState}
                      onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                      Estimated Students Count
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 750"
                      value={formData.estimatedStudents}
                      onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value })}
                      className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Required Shoe Models & Sizes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Boys Formal Oxford, Girls Buckle, PT White Canvas (UK 1 to 7)"
                    value={formData.shoeModelsRequested}
                    onChange={(e) => setFormData({ ...formData, shoeModelsRequested: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Additional Notes & Delivery Deadlines
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specify target academic session start date, custom logo embossing, or campus sizing schedule..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-primary px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? 'Submitting Proposal...' : 'Submit Institutional Enquiry'}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </main>
  );
};
