import React from 'react';
import { Badge } from 'react-bootstrap';

const UserTitleBadge = ({ role, selectedAward }) => {
    return (
        <div className="d-inline-flex align-items-center gap-1 ms-2" style={{ maxWidth: '100%' }}>
            {role === 'Admin' && (
                <Badge bg="danger" className="d-flex align-items-center gap-1 px-2 flex-shrink-0" style={{ fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(220,53,69,0.3)' }}>
                    👑 Адмін
                </Badge>
            )}
            
            {role === 'Reviewer' && (
                <Badge bg="primary" className="d-flex align-items-center gap-1 px-2 flex-shrink-0" style={{ fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(13,110,253,0.3)' }}>
                    ✍️ Критик
                </Badge>
            )}

            {role === 'Moderator' && (
                <Badge bg="secondary" className="d-flex align-items-center gap-1 px-2 flex-shrink-0" style={{ fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(108,117,125,0.3)' }}>
                    🔒 Модератор
                </Badge>
            )}

            {selectedAward && (
                <Badge 
                    bg="dark" 
                    className="d-flex align-items-center gap-1 px-2 border" 
                    style={{ 
                        fontSize: '0.75rem', 
                        borderColor: 'var(--border-color)', 
                        color: 'var(--text-main)',
                        maxWidth: '100%'
                    }}
                >
                    <span className="flex-shrink-0">{selectedAward.icon}</span>
                    
                    <span 
                        className="fw-normal text-truncate" 
                        style={{ maxWidth: '130px' }} 
                        title={selectedAward.name}   
                    >
                        {selectedAward.name}
                    </span>
                </Badge>
            )}
        </div>
    );
};

export default UserTitleBadge;