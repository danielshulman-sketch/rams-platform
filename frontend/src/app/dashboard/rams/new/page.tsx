'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';

type Hazard = {
    id: string;
    description: string;
    category: string;
    likelihood: number;
    severity: number;
    controls: string[];
    residualRisk: number;
};

function NewRamsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // AI Generation
    const [scopeFile, setScopeFile] = useState<File | null>(null);
    const [generatingWithAI, setGeneratingWithAI] = useState(false);

    const [selectedJobId, setSelectedJobId] = useState(jobId || '');
    const [title, setTitle] = useState('');
    const [scopeOfWorks, setScopeOfWorks] = useState('');
    const [hazards, setHazards] = useState<Hazard[]>([]);
    const [methodStatement, setMethodStatement] = useState('');
    const [emergencyInfo, setEmergencyInfo] = useState({
        hospital: '',
        hospitalAddress: '',
        hospitalPhone: '',
        emergencyContact: '',
    });

    const { data: jobs } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const response = await api.getJobs();
            return response.data;
        },
    });

    const selectedJob = jobs?.find((j: any) => j.id === selectedJobId);

    const addHazard = () => {
        setHazards([
            ...hazards,
            {
                id: Date.now().toString(),
                description: '',
                category: 'general',
                likelihood: 3,
                severity: 3,
                controls: [''],
                residualRisk: 3,
            },
        ]);
    };

    const updateHazard = (id: string, field: string, value: any) => {
        setHazards(hazards.map(h =>
            h.id === id ? { ...h, [field]: value } : h
        ));
    };

    const addControl = (hazardId: string) => {
        setHazards(hazards.map(h =>
            h.id === hazardId ? { ...h, controls: [...h.controls, ''] } : h
        ));
    };

    const updateControl = (hazardId: string, index: number, value: string) => {
        setHazards(hazards.map(h =>
            h.id === hazardId
                ? { ...h, controls: h.controls.map((c, i) => i === index ? value : c) }
                : h
        ));
    };

    const removeHazard = (id: string) => {
        setHazards(hazards.filter(h => h.id !== id));
    };

    const calculateRisk = (likelihood: number, severity: number) => {
        const risk = likelihood * severity;
        if (risk <= 4) return { level: 'Low', color: 'bg-green-100 text-green-700' };
        if (risk <= 12) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
        return { level: 'High', color: 'bg-red-100 text-red-700' };
    };

    const handleAIGeneration = async () => {
        if (!scopeFile) {
            alert('Please select a scope of work PDF first');
            return;
        }

        setGeneratingWithAI(true);
        setError('');

        try {
            const response = await api.generateRamsWithAI(scopeFile, selectedJob);
            const data = response.data;

            // Auto-fill form with AI-generated data
            if (data.activityDescription) setTitle(data.activityDescription);
            if (data.methodStatement) {
                const statements = Array.isArray(data.methodStatement)
                    ? data.methodStatement.join('\n')
                    : data.methodStatement;
                setMethodStatement(statements);
            }

            // Convert AI hazards to our format
            if (data.hazards && data.hazards.length > 0) {
                const aiHazards = data.hazards.map((h: any, idx: number) => ({
                    id: Date.now().toString() + idx,
                    description: h.description || '',
                    category: 'general',
                    likelihood: h.riskLevel === 'High' ? 4 : h.riskLevel === 'Low' ? 2 : 3,
                    severity: h.riskLevel === 'High' ? 4 : h.riskLevel === 'Low' ? 2 : 3,
                    controls: h.controls || (data.controlMeasures ? data.controlMeasures.map((c: any) => c.description) : ['']),
                    residualRisk: h.riskLevel === 'High' ? 4 : h.riskLevel === 'Low' ? 2 : 3,
                }));
                setHazards(aiHazards);
            }

            if (data.emergencyInfo) {
                setEmergencyInfo(prev => ({
                    ...prev,
                    emergencyContact: data.emergencyInfo.emergencyContact || prev.emergencyContact,
                }));
            }

            alert('✅ AI generation complete! Review and edit the generated RAMS.');
            setStep(2); // Move to next step
        } catch (err: any) {
            console.error('AI generation error:', err);
            setError(err.response?.data?.message || 'Failed to generate RAMS with AI. Please check your API key.');
        } finally {
            setGeneratingWithAI(false);
        }
    };

    const handleSubmit = async (status: string = 'draft') => {
        setLoading(true);
        setError('');

        try {
            const content = {
                projectDetails: selectedJob,
                scopeOfWorks,
                hazards: hazards.map(h => ({
                    description: h.description,
                    category: h.category,
                    riskAssessment: {
                        likelihood: h.likelihood,
                        severity: h.severity,
                        rating: h.likelihood * h.severity,
                    },
                    controls: h.controls.filter(c => c.trim()),
                    residualRisk: h.residualRisk,
                })),
                methodStatement,
                emergency: emergencyInfo,
            };

            const response = await api.createRams({
                jobId: selectedJobId,
                title,
                content,
                status,
            });

            router.push(`/dashboard/rams/${response.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create RAMS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create RAMS Document</h1>
                <p className="text-gray-600 mt-1">Step {step} of 7</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Step 1: Select Job */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Job</CardTitle>
                        <CardDescription>Choose the job this RAMS is for</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="job">Job</Label>
                            <select
                                id="job"
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Select a job...</option>
                                {jobs?.map((job: any) => (
                                    <option key={job.id} value={job.id}>
                                        {job.projectName} - {job.clientName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedJob && (
                            <div className="p-4 bg-gray-50 rounded-md space-y-2 text-sm">
                                <div><strong>Client:</strong> {selectedJob.clientName}</div>
                                <div><strong>Site:</strong> {selectedJob.siteAddress}</div>
                                <div><strong>Postcode:</strong> {selectedJob.sitePostcode}</div>
                            </div>
                        )}

                        {/* AI-Powered RAMS Generation */}
                        {selectedJobId && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                                        <span>✨</span>
                                        AI-Powered RAMS Generation
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Upload your scope of work PDF and let AI generate the complete RAMS using your knowledge base
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scopePdf" className="text-blue-900 font-medium">
                                        Scope of Work PDF
                                    </Label>
                                    <Input
                                        id="scopePdf"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setScopeFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer bg-white"
                                    />
                                    {scopeFile && (
                                        <p className="text-sm text-blue-600 flex items-center gap-1">
                                            <span>📄</span>
                                            {scopeFile.name} ({(scopeFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>

                                <Button
                                    onClick={handleAIGeneration}
                                    disabled={!scopeFile || generatingWithAI}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-12"
                                >
                                    {generatingWithAI ? (
                                        <>
                                            <span className="animate-spin mr-2">⚙️</span>
                                            Generating... (10-30 seconds)
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">✨</span>
                                            Generate Complete RAMS with AI
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-blue-700 text-center italic">
                                    AI will analyze your scope and knowledge base to auto-fill all RAMS sections
                                </p>
                            </div>
                        )}

                        <Button onClick={() => setStep(2)} disabled={!selectedJobId}>
                            Next
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Title & Scope */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>RAMS Details</CardTitle>
                        <CardDescription>Enter title and scope of works</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">RAMS Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Steel Beam Installation - Risk Assessment"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scope">Scope of Works</Label>
                            <textarea
                                id="scope"
                                value={scopeOfWorks}
                                onChange={(e) => setScopeOfWorks(e.target.value)}
                                rows={6}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Detailed description of the work tasks..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!title || !scopeOfWorks}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Hazard Identification */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Identify Hazards</CardTitle>
                        <CardDescription>List all potential hazards for this work</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hazards.map((hazard, index) => (
                            <div key={hazard.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-medium">Hazard {index + 1}</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeHazard(hazard.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={hazard.description}
                                        onChange={(e) => updateHazard(hazard.id, 'description', e.target.value)}
                                        placeholder="Working at height, Manual handling, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        value={hazard.category}
                                        onChange={(e) => updateHazard(hazard.id, 'category', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="general">General</option>
                                        <option value="height">Working at Height</option>
                                        <option value="lifting">Lifting Operations</option>
                                        <option value="hot_works">Hot Works</option>
                                        <option value="manual_handling">Manual Handling</option>
                                        <option value="electrical">Electrical</option>
                                    </select>
                                </div>
                            </div>
                        ))}

                        <Button onClick={addHazard} variant="outline" className="w-full">
                            + Add Hazard
                        </Button>

                        <div className="flex gap-3">
                            <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                            <Button onClick={() => setStep(4)} disabled={hazards.length === 0}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Risk Assessment */}
            {step === 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Risk Assessment</CardTitle>
                        <CardDescription>Assess likelihood and severity for each hazard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hazards.map((hazard, index) => {
                            const risk = calculateRisk(hazard.likelihood, hazard.severity);
                            return (
                                <div key={hazard.id} className="p-4 border rounded-lg space-y-3">
                                    <h4 className="font-medium">{hazard.description}</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Likelihood (1-5)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={hazard.likelihood}
                                                onChange={(e) => updateHazard(hazard.id, 'likelihood', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Severity (1-5)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={hazard.severity}
                                                onChange={(e) => updateHazard(hazard.id, 'severity', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Risk Rating:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${risk.color}`}>
                                            {hazard.likelihood * hazard.severity} - {risk.level}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex gap-3">
                            <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                            <Button onClick={() => setStep(5)}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Control Measures */}
            {step === 5 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Control Measures</CardTitle>
                        <CardDescription>Define controls to mitigate each hazard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hazards.map((hazard) => (
                            <div key={hazard.id} className="p-4 border rounded-lg space-y-3">
                                <h4 className="font-medium">{hazard.description}</h4>

                                {hazard.controls.map((control, index) => (
                                    <div key={index} className="space-y-2">
                                        <Label>Control {index + 1}</Label>
                                        <textarea
                                            value={control}
                                            onChange={(e) => updateControl(hazard.id, index, e.target.value)}
                                            rows={2}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Use approved scaffold, wear safety harness, etc."
                                        />
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addControl(hazard.id)}
                                >
                                    + Add Control
                                </Button>

                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Residual Risk (1-5)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={hazard.residualRisk}
                                        onChange={(e) => updateHazard(hazard.id, 'residualRisk', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-3">
                            <Button onClick={() => setStep(4)} variant="outline">Back</Button>
                            <Button onClick={() => setStep(6)}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 6: Method Statement */}
            {step === 6 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Method Statement</CardTitle>
                        <CardDescription>Describe the step-by-step method of work</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="method">Method of Work</Label>
                            <textarea
                                id="method"
                                value={methodStatement}
                                onChange={(e) => setMethodStatement(e.target.value)}
                                rows={12}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="1. Set up exclusion zone...&#10;2. Inspect equipment...&#10;3. Brief all personnel..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setStep(5)} variant="outline">Back</Button>
                            <Button onClick={() => setStep(7)} disabled={!methodStatement}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 7: Emergency Arrangements */}
            {step === 7 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Arrangements</CardTitle>
                        <CardDescription>Emergency contact information and procedures</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Auto-fill button */}
                        {selectedJob?.sitePostcode && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-sm text-blue-900">Auto-fill Hospital Details</div>
                                        <div className="text-xs text-blue-700 mt-1">
                                            Lookup nearest A&E for {selectedJob.sitePostcode}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                            try {
                                                console.log('Looking up hospital for postcode:', selectedJob.sitePostcode);
                                                const response = await api.lookupHospital(selectedJob.sitePostcode);
                                                console.log('Hospital lookup response:', response.data);

                                                if (response.data && !response.data.error) {
                                                    setEmergencyInfo({
                                                        hospital: response.data.hospitalName || '',
                                                        hospitalAddress: response.data.address || '',
                                                        hospitalPhone: response.data.phone || '',
                                                        emergencyContact: emergencyInfo.emergencyContact,
                                                    });
                                                    alert('Hospital details filled successfully!');
                                                } else {
                                                    alert('No hospital found for this postcode: ' + (response.data?.error || 'Unknown error'));
                                                }
                                            } catch (err: any) {
                                                console.error('Failed to lookup hospital:', err);
                                                alert('Error looking up hospital: ' + (err.response?.data?.message || err.message || 'Network error'));
                                            }
                                        }}
                                    >
                                        Auto-fill from Postcode
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="hospital">Nearest Hospital</Label>
                            <Input
                                id="hospital"
                                value={emergencyInfo.hospital}
                                onChange={(e) => setEmergencyInfo({ ...emergencyInfo, hospital: e.target.value })}
                                placeholder="St. Mary's Hospital"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospitalAddress">Hospital Address</Label>
                            <Input
                                id="hospitalAddress"
                                value={emergencyInfo.hospitalAddress}
                                onChange={(e) => setEmergencyInfo({ ...emergencyInfo, hospitalAddress: e.target.value })}
                                placeholder="123 Hospital Road, London"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospitalPhone">Hospital Phone</Label>
                            <Input
                                id="hospitalPhone"
                                value={emergencyInfo.hospitalPhone}
                                onChange={(e) => setEmergencyInfo({ ...emergencyInfo, hospitalPhone: e.target.value })}
                                placeholder="020 1234 5678"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                                id="emergencyContact"
                                value={emergencyInfo.emergencyContact}
                                onChange={(e) => setEmergencyInfo({ ...emergencyInfo, emergencyContact: e.target.value })}
                                placeholder="Site Manager: 07XXX XXXXXX"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button onClick={() => setStep(6)} variant="outline">Back</Button>
                            <Button
                                onClick={() => handleSubmit('draft')}
                                variant="outline"
                                disabled={loading}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit('review')}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Submit for Review'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function NewRamsPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto space-y-6">Loading...</div>}>
            <NewRamsClient />
        </Suspense>
    );
}
