#!/usr/bin/env python3
"""
Generate a comprehensive sample HR policy Excel file for testing
"""

import pandas as pd
from pathlib import Path

def create_hr_policy_excel():
    """Create a comprehensive HR policy Excel file"""
    
    # HR Policy data
    hr_policies = {
        "Policy Category": [
            "Leave and Vacation",
            "Leave and Vacation", 
            "Leave and Vacation",
            "Workplace Conduct",
            "Workplace Conduct",
            "Workplace Conduct",
            "Remote Work",
            "Remote Work",
            "Performance Management",
            "Performance Management",
            "Disciplinary Actions",
            "Disciplinary Actions",
            "Disciplinary Actions",
            "Benefits and Compensation",
            "Benefits and Compensation",
            "Training and Development",
            "Health and Safety",
            "Health and Safety",
            "Communication and Technology",
            "Communication and Technology"
        ],
        "Policy Title": [
            "Annual Leave Policy",
            "Sick Leave Policy",
            "Maternity/Paternity Leave",
            "Professional Dress Code",
            "Harassment and Discrimination",
            "Punctuality and Attendance",
            "Work From Home Guidelines",
            "Equipment and Security",
            "Annual Performance Reviews",
            "Goal Setting and KPIs",
            "Progressive Discipline Process",
            "Termination Procedures",
            "Grievance and Appeals",
            "Overtime and Compensation",
            "Health Insurance Benefits",
            "Professional Development",
            "Workplace Safety Protocols",
            "Emergency Procedures",
            "Email and Internet Usage",
            "Confidentiality and Data Protection"
        ],
        "Policy Description": [
            "Full-time employees are entitled to 20 days of paid annual leave per year. Part-time employees receive prorated leave. Leave must be requested at least 2 weeks in advance through the HR system.",
            "Employees may take up to 10 days of paid sick leave per year. Medical certificate required for absences exceeding 3 consecutive days. Unused sick leave does not carry over to the next year.",
            "New parents are entitled to 12 weeks of paid parental leave. Additional unpaid leave may be available up to 6 months total. Must provide 30 days advance notice when possible.",
            "Business casual attire is required in office settings. No shorts, flip-flops, tank tops, or revealing clothing. Client-facing roles require business professional dress. Remote workers should dress appropriately for video calls.",
            "Zero tolerance policy for harassment, discrimination, or bullying based on race, gender, religion, age, sexual orientation, or any protected characteristic. All incidents must be reported immediately to HR.",
            "Standard work hours are 9 AM to 5 PM. Employees must arrive on time and maintain regular attendance. Chronic lateness or absenteeism will result in disciplinary action.",
            "Remote work permitted up to 3 days per week with manager approval. Must maintain productivity standards and be available during core hours (10 AM - 3 PM). Home office must meet basic ergonomic requirements.",
            "Company equipment must be used responsibly and returned in good condition. VPN required for all remote access. Personal use of company devices is limited and monitored.",
            "Annual performance reviews conducted in December. Mid-year check-ins required in June. Reviews assess goal achievement, competencies, and career development needs.",
            "SMART goals must be set quarterly. Performance metrics tracked monthly. Employees failing to meet 70% of goals enter performance improvement process.",
            "Disciplinary actions follow progressive steps: verbal warning, written warning, final warning, termination. Serious misconduct may result in immediate termination.",
            "Employment may be terminated for cause (misconduct, poor performance) or without cause (layoffs, restructuring). Two weeks notice required from employee, appropriate severance provided by company.",
            "Employees may appeal disciplinary actions or file grievances within 30 days. HR will investigate all complaints fairly and confidentially. External mediation available if needed.",
            "Overtime (over 40 hours/week) paid at 1.5x rate for non-exempt employees. Pre-approval required for overtime work. Compensatory time off may be offered instead of pay.",
            "Company provides comprehensive health insurance covering medical, dental, and vision. Employee contributes 20% of premium cost. Coverage begins first day of employment.",
            "Annual training budget of $2,000 per employee for professional development. Must be job-related and pre-approved. Conference attendance, certifications, and courses eligible.",
            "All workplace injuries must be reported immediately. First aid kits available on each floor. Safety training required annually. Personal protective equipment provided when needed.",
            "In case of fire, evacuate via nearest exit. Designated meeting point in parking lot. Tornado: move to basement or interior room. Medical emergency: call 911 then security.",
            "Email and internet usage monitored for security and productivity. Personal use allowed during breaks. Prohibited: accessing inappropriate content, downloading unauthorized software, sharing confidential information.",
            "Employees must protect confidential company and customer information. No sharing of proprietary data, financial information, or trade secrets. Violation may result in immediate termination and legal action."
        ],
        "Consequences for Violations": [
            "Unauthorized leave may result in unpaid time off and disciplinary action. Excessive unauthorized absences can lead to termination. False leave requests are grounds for immediate dismissal.",
            "Abuse of sick leave policy may require medical verification for all future sick days. Pattern of suspicious absences may result in disciplinary action or termination.",
            "Failure to provide proper documentation may delay leave approval. Unauthorized extended absence may be treated as job abandonment and result in termination.",
            "First dress code violation: verbal reminder. Second violation: written warning. Continued violations may result in being sent home without pay and further disciplinary action.",
            "First offense may result in mandatory training and formal reprimand. Serious violations result in suspension or immediate termination. Legal action may be pursued for severe cases.",
            "Tardiness pattern (3+ times/month): verbal warning. Continued tardiness: written warning, then suspension. Excessive absenteeism may result in termination.",
            "Productivity decline while remote may result in return to office requirement. Policy violations may lead to revocation of remote work privileges permanently.",
            "Misuse of company equipment may result in revocation of remote work privileges, disciplinary action, and potential liability for damages or security breaches.",
            "Poor performance ratings may result in performance improvement plan (90 days). Failure to improve may lead to demotion or termination. Exceptional performance rewarded with bonuses/promotions.",
            "Consistently missing goals (2+ quarters) triggers performance improvement plan. Failure to improve within 90 days may result in termination or role reassignment.",
            "Failure to improve after final warning results in termination. Serious misconduct bypasses progressive discipline and may result in immediate dismissal.",
            "Violation of termination procedures may affect severance eligibility. Failure to return company property may result in deduction from final paycheck.",
            "Frivolous or false complaints may result in disciplinary action. Retaliation against complainants strictly prohibited and will result in immediate termination.",
            "Unauthorized overtime will not be compensated and may result in disciplinary action. Excessive overtime without approval may lead to written warning.",
            "Failure to enroll in required benefits within deadline may result in waiting until next open enrollment period. COBRA available for departing employees.",
            "Misuse of training budget may require repayment of funds. Failure to complete approved training may affect future development opportunities and performance reviews.",
            "Failure to follow safety protocols may result in disciplinary action. Causing preventable workplace injury may lead to suspension or termination.",
            "Failure to participate in emergency drills may result in safety training requirement. Ignoring emergency procedures may lead to disciplinary action.",
            "Inappropriate internet usage may result in restriction of access, written warning, or termination. Sharing confidential information electronically may result in immediate dismissal.",
            "First confidentiality breach: formal reprimand and additional training. Serious violations result in immediate termination and potential legal action including lawsuits for damages."
        ]
    }
    
    # Create DataFrame
    df = pd.DataFrame(hr_policies)
    
    # Save to Excel file
    output_path = Path("/app/Sample_HR_Policies.xlsx")
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='HR Policies', index=False)
    
    print(f"✅ Created comprehensive HR policy Excel file: {output_path}")
    print(f"📊 Contains {len(df)} HR policies across {len(df['Policy Category'].unique())} categories")
    print("\n📋 Policy Categories included:")
    for category in df['Policy Category'].unique():
        count = len(df[df['Policy Category'] == category])
        print(f"  • {category}: {count} policies")

if __name__ == "__main__":
    create_hr_policy_excel()