/**
 * Support Resources Component
 * Connects users with legal aid, mental health support,
 * advocacy organizations, and crisis resources
 */

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Chip } from './Chip';

interface SupportResource {
  id: string;
  name: string;
  type: 'legal' | 'mental-health' | 'advocacy' | 'crisis' | 'financial' | 'educational';
  description: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  availability: {
    hours?: string;
    languages?: string[];
    cost?: 'free' | 'sliding-scale' | 'paid';
  };
  location: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  specialties?: string[];
  verified: boolean;
  rating?: number;
  lastUpdated: string;
}

interface SupportResourcesProps {
  userLocation?: string;
  incidentTypes?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'crisis';
  onResourceContact?: (resource: SupportResource, contactMethod: string) => void;
}

export function SupportResources({
  userLocation,
  incidentTypes: _incidentTypes = [],
  urgency = 'medium',
  onResourceContact
}: SupportResourcesProps) {
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showCrisisHelp, setShowCrisisHelp] = useState(urgency === 'crisis');

  useEffect(() => {
    loadResources();
  }, [userLocation, selectedTypes]);

  const loadResources = async () => {
    setLoading(true);
    try {
      // In a real app, this would call ApiService.getSupportResources
      // For now, we'll use mock data
      const mockResources: SupportResource[] = [
        {
          id: '1',
          name: 'NAACP Legal Defense Fund',
          type: 'legal',
          description: 'Provides legal assistance for civil rights violations and discrimination cases.',
          contact: {
            phone: '212-965-2200',
            email: 'info@naacpldf.org',
            website: 'https://naacpldf.org'
          },
          availability: {
            hours: 'Mon-Fri 9AM-5PM EST',
            languages: ['English', 'Spanish'],
            cost: 'free'
          },
          location: {
            city: 'New York',
            state: 'NY',
            country: 'United States',
            remote: true
          },
          specialties: ['Employment Discrimination', 'Housing Rights', 'Police Misconduct'],
          verified: true,
          rating: 4.8,
          lastUpdated: '2024-01-15'
        },
        {
          id: '2',
          name: 'Crisis Text Line',
          type: 'crisis',
          description: '24/7 crisis support via text message for anyone in crisis.',
          contact: {
            phone: 'Text HOME to 741741',
            website: 'https://crisistextline.org'
          },
          availability: {
            hours: '24/7',
            languages: ['English', 'Spanish'],
            cost: 'free'
          },
          location: {
            remote: true
          },
          specialties: ['Crisis Support', 'Mental Health', 'Trauma'],
          verified: true,
          rating: 4.9,
          lastUpdated: '2024-01-10'
        },
        {
          id: '3',
          name: 'National Alliance on Mental Illness (NAMI)',
          type: 'mental-health',
          description: 'Mental health support, education, and advocacy organization.',
          contact: {
            phone: '1-800-950-NAMI',
            email: 'info@nami.org',
            website: 'https://nami.org'
          },
          availability: {
            hours: 'Mon-Fri 10AM-10PM EST',
            languages: ['English', 'Spanish', 'Korean', 'Mandarin'],
            cost: 'free'
          },
          location: {
            remote: true
          },
          specialties: ['Depression', 'Anxiety', 'PTSD', 'Support Groups'],
          verified: true,
          rating: 4.7,
          lastUpdated: '2024-01-12'
        },
        {
          id: '4',
          name: 'Equal Employment Opportunity Commission',
          type: 'legal',
          description: 'Federal agency that enforces workplace discrimination laws.',
          contact: {
            phone: '1-800-669-4000',
            website: 'https://eeoc.gov'
          },
          availability: {
            hours: 'Mon-Fri 8AM-8PM EST',
            languages: ['English', 'Spanish', 'ASL'],
            cost: 'free'
          },
          location: {
            remote: true
          },
          specialties: ['Workplace Discrimination', 'Sexual Harassment', 'Retaliation'],
          verified: true,
          rating: 4.5,
          lastUpdated: '2024-01-08'
        },
        {
          id: '5',
          name: 'Local Community Legal Aid',
          type: 'legal',
          description: 'Provides free legal services to low-income individuals.',
          contact: {
            phone: '555-123-4567',
            email: 'help@communitylegal.org',
            address: '123 Main St, Your City, ST 12345'
          },
          availability: {
            hours: 'Mon-Wed-Fri 9AM-4PM',
            cost: 'free'
          },
          location: {
            city: userLocation?.split(',')[0] || 'Your City',
            state: userLocation?.split(',')[1]?.trim() || 'ST',
            country: 'United States'
          },
          specialties: ['Housing Rights', 'Consumer Protection', 'Family Law'],
          verified: true,
          rating: 4.3,
          lastUpdated: '2024-01-05'
        }
      ];

      // Filter resources based on selected types
      let filteredResources = mockResources;
      if (selectedTypes.length > 0) {
        filteredResources = mockResources.filter(resource => 
          selectedTypes.includes(resource.type)
        );
      }

      setResources(filteredResources);
    } catch (error) {
      console.error('Error loading support resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceContact = (resource: SupportResource, method: string) => {
    onResourceContact?.(resource, method);
    
    // Track contact attempt for analytics
    console.log('Resource contacted:', { resourceId: resource.id, method });
  };

  const resourceTypes = [
    { id: 'crisis', label: 'Crisis Support', color: 'red' },
    { id: 'legal', label: 'Legal Aid', color: 'blue' },
    { id: 'mental-health', label: 'Mental Health', color: 'green' },
    { id: 'advocacy', label: 'Advocacy', color: 'purple' },
    { id: 'financial', label: 'Financial Aid', color: 'yellow' },
    { id: 'educational', label: 'Education', color: 'indigo' }
  ];

  const toggleResourceType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Crisis Alert */}
      {showCrisisHelp && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                If you're in immediate danger or having thoughts of self-harm, please reach out for help right away.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.open('tel:988', '_self')}
                >
                  Call 988 (Suicide & Crisis Lifeline)
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => window.open('sms:741741?body=HOME', '_self')}
                >
                  Text HOME to 741741
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('tel:911', '_self')}
                >
                  Call 911
                </Button>
              </div>
            </div>
            <button
              onClick={() => setShowCrisisHelp(false)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </Card>
      )}

      {/* Filter by Resource Type */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filter Support Resources
        </h3>
        <div className="flex flex-wrap gap-2">
          {resourceTypes.map(type => (
            <button
              key={type.id}
              onClick={() => toggleResourceType(type.id)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${selectedTypes.includes(type.id)
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {type.label}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => setSelectedTypes([])}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          )}
        </div>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v1.306z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                No resources found for the selected filters.
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedTypes([])}
                className="mt-4"
              >
                Show All Resources
              </Button>
            </div>
          </Card>
        ) : (
          resources.map(resource => (
            <Card key={resource.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {resource.name}
                    </h3>
                    {resource.verified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Chip variant="secondary" size="sm">
                      {resourceTypes.find(t => t.id === resource.type)?.label || resource.type}
                    </Chip>
                    {resource.availability.cost && (
                      <Chip 
                        variant={resource.availability.cost === 'free' ? 'primary' : 'secondary'} 
                        size="sm"
                      >
                        {resource.availability.cost}
                      </Chip>
                    )}
                    {resource.location.remote && (
                      <Chip variant="secondary" size="sm">Remote Available</Chip>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {resource.description}
                  </p>
                  
                  {resource.specialties && resource.specialties.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Specialties:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {resource.specialties.map(specialty => (
                          <Chip key={specialty} size="sm">
                            {specialty}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {resource.availability.hours && (
                      <p>Hours: {resource.availability.hours}</p>
                    )}
                    {resource.availability.languages && (
                      <p>Languages: {resource.availability.languages.join(', ')}</p>
                    )}
                    {resource.location.city && (
                      <p>Location: {resource.location.city}, {resource.location.state}</p>
                    )}
                  </div>
                </div>
                
                {resource.rating && (
                  <div className="flex items-center space-x-1 text-sm">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400">
                      {resource.rating}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Contact Options */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {resource.contact.phone && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      window.open(`tel:${resource.contact.phone}`, '_self');
                      handleResourceContact(resource, 'phone');
                    }}
                  >
                    Call {resource.contact.phone}
                  </Button>
                )}
                
                {resource.contact.website && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      window.open(resource.contact.website, '_blank');
                      handleResourceContact(resource, 'website');
                    }}
                  >
                    Visit Website
                  </Button>
                )}
                
                {resource.contact.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(`mailto:${resource.contact.email}`, '_self');
                      handleResourceContact(resource, 'email');
                    }}
                  >
                    Email
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* Add Resource Suggestion */}
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
        <div className="text-center py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Know of a resource that should be listed here?
          </p>
          <Button variant="secondary" size="sm">
            Suggest a Resource
          </Button>
        </div>
      </Card>
    </div>
  );
}