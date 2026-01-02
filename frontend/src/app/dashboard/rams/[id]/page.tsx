'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';

export default function RamsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ramsId = params.id as string;
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const { data: rams, isLoading, error } = useQuery({
        queryKey: ['rams', ramsId],
        queryFn: async () => {
            const response = await api.getRamsById(ramsId);
            return response.data;
        },
    });

    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const response = await api.getTemplates();
            return response.data;
        },
    });

    useEffect(() => {
        if (!selectedTemplateId && templates?.length) {
            const defaultTemplate = templates.find((template: any) => template.isDefault);
            if (defaultTemplate) {
                setSelectedTemplateId(defaultTemplate.id);
            }
        }
    }, [selectedTemplateId, templates]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading RAMS...</div>
            </div>
        );
    }

    if (error || !rams) {
        return (
            <div className="space-y-4">
                <div className="p-4 text-red-600 bg-red-50 rounded-md">
                    RAMS not found or failed to load.
                </div>
                <Button onClick={() => router.push('/dashboard/rams')}>Back to RAMS</Button>
            </div>
        );
    }

    const content = rams.content || {};
    const calculateRisk = (likelihood: number, severity: number) => {
        const risk = likelihood * severity;
        if (risk <= 4) return { level: 'Low', color: 'bg-green-100 text-green-700' };
        if (risk <= 12) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
        return { level: 'High', color: 'bg-red-100 text-red-700' };
    };

    const selectedTemplate = templates?.find((template: any) => template.id === selectedTemplateId);
    const templateFormat = selectedTemplate?.fileType?.toLowerCase() === 'docx' ? 'docx' : 'pdf';

    const downloadRams = async (format: 'docx' | 'pdf', templateId?: string) => {
        setIsDownloading(true);
        setDownloadError('');
        try {
            const response = await api.exportRams(ramsId, format, templateId);
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${rams.title || 'rams'}.${format}`;
            if (contentDisposition) {
                const match = /filename="([^"]+)"/.exec(contentDisposition);
                if (match?.[1]) {
                    filename = match[1];
                }
            }

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setDownloadError(err.response?.data?.message || 'Failed to export RAMS document.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{rams.title}</h1>
                        <span className={`
              px-3 py-1 text-sm font-medium rounded-full
              ${rams.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
              ${rams.status === 'review' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${rams.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
                            {rams.status}
                        </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                        {rams.job?.projectName} • Version {rams.version}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push('/dashboard/rams')}>
                        Back to RAMS
                    </Button>
                    <Button
                        onClick={() => downloadRams('pdf')}
                        disabled={isDownloading}
                    >
                        Download PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => downloadRams('docx')}
                        disabled={isDownloading}
                    >
                        Download DOCX
                    </Button>
                </div>
            </div>

            {(templates?.length || downloadError) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Export with Template</CardTitle>
                        <CardDescription>Download using a saved template format.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {templates?.length ? (
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map((template: any) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} ({template.fileType?.toUpperCase() || 'PDF'})
                                            {template.isDefault ? ' - Default' : ''}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    onClick={() => downloadRams(templateFormat, selectedTemplateId)}
                                    disabled={!selectedTemplateId || isDownloading}
                                >
                                    {isDownloading ? 'Preparing...' : `Download ${templateFormat.toUpperCase()}`}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                No templates available. Upload one to export with a custom format.
                            </div>
                        )}
                        {downloadError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {downloadError}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Project Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Project Name</div>
                            <div className="mt-1">{content.projectDetails?.projectName}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Client</div>
                            <div className="mt-1">{content.projectDetails?.clientName}</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Site Address</div>
                        <div className="mt-1">{content.projectDetails?.siteAddress}, {content.projectDetails?.sitePostcode}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Scope of Works */}
            <Card>
                <CardHeader>
                    <CardTitle>Scope of Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{content.scopeOfWorks}</p>
                </CardContent>
            </Card>

            {/* Hazards & Risk Assessment */}
            <Card>
                <CardHeader>
                    <CardTitle>Hazards & Risk Assessment</CardTitle>
                    <CardDescription>Identified hazards with controls and residual risk</CardDescription>
                </CardHeader>
                <CardContent>
                    {content.hazards && content.hazards.length > 0 ? (
                        <div className="space-y-6">
                            {content.hazards.map((hazard: any, index: number) => {
                                const initialRisk = calculateRisk(
                                    hazard.riskAssessment?.likelihood || 3,
                                    hazard.riskAssessment?.severity || 3
                                );
                                return (
                                    <div key={index} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg">{hazard.description}</h4>
                                                <span className="text-sm text-gray-500 capitalize">{hazard.category}</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${initialRisk.color}`}>
                                                Initial: {hazard.riskAssessment?.rating || 9} - {initialRisk.level}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Likelihood</div>
                                                <div className="font-medium">{hazard.riskAssessment?.likelihood}/5</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Severity</div>
                                                <div className="font-medium">{hazard.riskAssessment?.severity}/5</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-gray-700 mb-2">Control Measures:</div>
                                            <ul className="list-disc list-inside space-y-1">
                                                {hazard.controls?.map((control: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-700">{control}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Residual Risk:</span>
                                                <span className="font-medium">{hazard.residualRisk}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hazards identified</p>
                    )}
                </CardContent>
            </Card>

            {/* Method Statement */}
            <Card>
                <CardHeader>
                    <CardTitle>Method Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{content.methodStatement || 'Not provided'}</p>
                </CardContent>
            </Card>

            {/* Emergency Arrangements */}
            <Card>
                <CardHeader>
                    <CardTitle>Emergency Arrangements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {content.emergency?.hospital && (
                        <div>
                            <div className="text-sm font-medium text-gray-500">Nearest Hospital</div>
                            <div className="mt-1">{content.emergency.hospital}</div>
                            {content.emergency.hospitalAddress && (
                                <div className="text-sm text-gray-600">{content.emergency.hospitalAddress}</div>
                            )}
                            {content.emergency.hospitalPhone && (
                                <div className="text-sm text-gray-600">Phone: {content.emergency.hospitalPhone}</div>
                            )}
                        </div>
                    )}

                    {content.emergency?.emergencyContact && (
                        <div>
                            <div className="text-sm font-medium text-gray-500">Emergency Contact</div>
                            <div className="mt-1">{content.emergency.emergencyContact}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Version History */}
            {rams.versions && rams.versions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Version History</CardTitle>
                        <CardDescription>Recent changes to this document</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rams.versions.map((version: any) => (
                                <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div>
                                        <div className="font-medium">Version {version.versionNumber}</div>
                                        <div className="text-sm text-gray-600">
                                            {version.changeSummary || 'No description'} • {version.changedBy?.firstName} {version.changedBy?.lastName}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(version.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Document Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>Created by {rams.createdBy?.firstName} {rams.createdBy?.lastName} on {new Date(rams.createdAt).toLocaleDateString()}</div>
                        {rams.approvedBy && (
                            <div>Approved by {rams.approvedBy.firstName} {rams.approvedBy.lastName} on {new Date(rams.approvedAt).toLocaleDateString()}</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
