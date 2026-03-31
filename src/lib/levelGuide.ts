// Tiger Data Job Leveling Guide - Complete Data Model
// Extracted from Tiger Data Level Guides - Final Version and Senior Leader Level Guide

export type TrackType = "ic" | "manager" | "executive";

export interface LevelDimension {
  criteria: string;
  expectedBehaviors: string;
}

export interface Level {
  id: string;
  level: number;
  track: TrackType;
  code: string; // e.g. "P1", "M3", "VP"
  title: string; // e.g. "Entry Level Professional"
  description: string;
  dimensions: {
    knowledgeExperience: LevelDimension;
    organizationalImpact: LevelDimension;
    innovationComplexity: LevelDimension;
    communicationInfluence: LevelDimension;
    leadershipTalentMgmt: LevelDimension;
  };
}

export const DIMENSION_LABELS: Record<string, string> = {
  knowledgeExperience: "Knowledge & Experience",
  organizationalImpact: "Organizational Impact",
  innovationComplexity: "Innovation & Complexity",
  communicationInfluence: "Communication & Influence",
  leadershipTalentMgmt: "Leadership & Talent Management",
};

export const LEVELS: Level[] = [
  // ============================================
  // INDIVIDUAL CONTRIBUTORS (P1 - P6)
  // ============================================
  {
    id: "p1",
    level: 1,
    track: "ic",
    code: "P1",
    title: "Entry Level Professional",
    description: "Entry level professional role. Requires little to no previous experience. Work is closely supervised.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires broad theoretical job knowledge typically obtained through advanced education. Typically requires a University Degree or equivalent experience and less than 2 years prior relevant experience.",
        expectedBehaviors: "Grasp fundamental concepts in their field. They require guidance, handle basic tasks, and contribute to team goals while learning and growing their skills.",
      },
      organizationalImpact: {
        criteria: "Works to achieve operational targets within the job area which has some impact on the overall achievement of results for the department. Work is of limited scope, typically on smaller, less complex projects or task-related activities. Work is closely supervised.",
        expectedBehaviors: "Focuses on achieving specific targets, working on smaller, less complex tasks under close supervision. Contributes to department results by following guidelines, completing tasks accurately and efficiently, while developing their skills.",
      },
      innovationComplexity: {
        criteria: "Responsible for making minor changes in systems and processes to solve problems. Identifies, defines and addresses problems that are not immediately evident but typically not complex. Problems are typically within the immediate job area. Problems are typically solved through drawing from prior experiences or standard procedures and basic analysis.",
        expectedBehaviors: "Follow established procedures, suggest minor improvements, and handle straightforward tasks. Seek guidance for complex issues, focusing on learning and applying basic concepts rather than driving major innovation.",
      },
      communicationInfluence: {
        criteria: "Communicates with contacts typically within the department on matters that involve obtaining or providing information requiring some explanation or interpretation in order to reach agreement.",
        expectedBehaviors: "Communicates clearly within the team, conveys information, asks questions, and provides work updates. Listens, seeks guidance, responds positively to feedback, and contributes to a collaborative environment, understanding their role in supporting team goals.",
      },
      leadershipTalentMgmt: {
        criteria: "N/A – Jobs at this level are focused on self-development.",
        expectedBehaviors: "N/A",
      },
    },
  },
  {
    id: "p2",
    level: 2,
    track: "ic",
    code: "P2",
    title: "Established Professional",
    description: "Established and productive professional position. Typically requires some work experience in non-support position. Work is moderately supervised.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires practical knowledge of the job area typically obtained through advanced education combined with experience. Typically requires a University Degree or equivalent experience and minimum 2 years of prior relevant experience; or an advanced degree without experience.",
        expectedBehaviors: "Utilizes practical knowledge gained through a University Degree and a minimum of 2 years of relevant experience to effectively perform tasks within the job area, potentially incorporating basic project management skills.",
      },
      organizationalImpact: {
        criteria: "Works to achieve operational targets within the job area with direct impact on department results. Works independently on larger, moderately complex projects/assignments. Sets objectives for own job area to meet the objectives or goals of projects and assignments.",
        expectedBehaviors: "Understands and follows set processes. Independently handles larger, moderately complex projects, impacting department results. Requires regular checks and support in decision-making.",
      },
      innovationComplexity: {
        criteria: "Responsible for making adjustments or recommended enhancements in systems and processes to solve problems or improve effectiveness of the job area. Problems and issues faced are general, and may require understanding of a broader set of issues but typically are not complex. Problems may require understanding of other job areas. Problems are typically solved through drawing from prior experiences, with analysis of the issue.",
        expectedBehaviors: "Shows initiative in improving systems and processes to solve straightforward problems, drawing on past experiences and related knowledge to enhance job effectiveness, using known solutions to address issues directly.",
      },
      communicationInfluence: {
        criteria: "Communicates with contacts typically within the department on matters that involve obtaining or providing information requiring some explanation or interpretation in order to reach agreement. May work to influence parties within their own job function at an operational level.",
        expectedBehaviors: "Communicates within the department to obtain or provide information, requiring some explanation or interpretation to reach agreement, and influences operational parties within their job function's direct network.",
      },
      leadershipTalentMgmt: {
        criteria: "May provide guidance and assistance to entry level professionals and/or support other team members.",
        expectedBehaviors: "Support new team member training. Share the workload to achieve team goals.",
      },
    },
  },
  {
    id: "p3",
    level: 3,
    track: "ic",
    code: "P3",
    title: "Experienced Professional",
    description: "Experienced professional position. Works under limited supervision and problems are moderately complex. Responsible for providing coaching, guidance, and training to others in job area.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires advanced knowledge of the job area typically obtained through advanced education combined with experience. May have practical knowledge of project management. Typically requires a University Degree or equivalent experience and minimum 5 years of prior relevant experience; or a Master's degree with 3 years; or a PhD without experience.",
        expectedBehaviors: "Applies advanced knowledge acquired through a University Degree and a minimum of 5 years of relevant experience, or equivalent qualifications, including potential project management expertise, to execute complex tasks and projects within the job area.",
      },
      organizationalImpact: {
        criteria: "Works to achieve operational targets with significant impact on departmental results. Works independently under limited supervision. May be responsible for entire projects or processes within the job area.",
        expectedBehaviors: "After receiving initial guidance, they proactively manage tasks, make informed decisions, and solve problems independently to meet the project brief.",
      },
      innovationComplexity: {
        criteria: "Responsible for making improvements of processes, systems or products to enhance performance of the job area. Problems and issues faced are difficult and may require understanding of a broader set of issues. Problems typically involve consideration of multiple issues, job areas or specialties. Problems are typically solved through drawing from prior experience and analysis of issues.",
        expectedBehaviors: "Proactively enhances processes, systems, or products to address complex problems involving multiple issues or specialties, using prior experience and thorough analysis. Capable of identifying similarities between situations and adapting past solutions to new problems.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function. May have responsibility for communicating with parties external to the organization (e.g., customers, vendors, etc.) Works to influence parties within and outside of the job function at an operational level regarding policies, practices and procedures.",
        expectedBehaviors: "Communicates effectively within and outside their job function, including external parties, to influence operational-level decisions on policies, practices, and procedures. Draws on broad experiences and understanding to adapt communication strategies as needed. Understands whom to consult or inform beyond their job function's direct network.",
      },
      leadershipTalentMgmt: {
        criteria: "May be responsible for providing guidance, coaching and training to other team members within the job area. May manage projects at this level, requiring responsibility for the delegation of work and the review of others' work product.",
        expectedBehaviors: "Provides guidance, coaching, and training to team members within the job area. Manage projects by effectively delegating tasks and reviewing team members' work to ensure high-quality outcomes.",
      },
    },
  },
  {
    id: "p4",
    level: 4,
    track: "ic",
    code: "P4",
    title: "Subject Matter Expert",
    description: "Recognized subject matter expert. Manage large projects or processes. Coaches, reviews, and delegates work to lower level team members. Operational targets with major impact on department results.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires deep knowledge of the job area typically obtained through advanced education combined with experience. Typically viewed as having a specialty within discipline. May have broad knowledge of project management. Typically requires a University Degree or equivalent experience and minimum 8 years of prior relevant experience; or Master's degree with 6 years; or PhD with 3 years of experience.",
        expectedBehaviors: "Exhibits deep expertise in their field, demonstrating advanced problem-solving skills and decision-making abilities. They contribute significantly to complex projects, often mentoring others and sharing knowledge to achieve high performance and drive results.",
      },
      organizationalImpact: {
        criteria: "Works to achieve operational targets with major impact on the departmental results. Contributes to the development of goals for the department and planning efforts (budgets, operational plans, etc.). May manage large projects or processes that span outside of the immediate job area. Work is performed with limited oversight.",
        expectedBehaviors: "Makes a substantial organizational impact by delivering high-quality work aligned with strategic goals. They mentor junior colleagues, provide thought leadership, and contribute decisively to projects. Their role includes driving innovation, efficiency, and positive change, often collaborating cross-functionally to influence broader outcomes.",
      },
      innovationComplexity: {
        criteria: "Responsible for making moderate to significant improvements of processes, systems or products to enhance performance of the job area. Problems and issues faced are numerous and undefined, and require detailed information gathering, analysis and investigation to understand the problem. Problems typically impact multiple departments or specialties. Problems are typically solved through drawing from prior experience and analysis of issues.",
        expectedBehaviors: "Innovates consistently and handles complexity adeptly within their domain. They generate creative solutions, manage technical challenges, and make impactful decisions that align with organizational goals.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function. Typically has responsibility for communicating with parties external to the organization (e.g., customers, vendors, etc.) Works to influence parties within and outside of the job function at an operational level regarding policies, procedures and practices.",
        expectedBehaviors: "Excels in communication and influence. They adeptly articulate ideas, adapt their communication style, and listen actively. They influence through data-driven insights, effective negotiation, and consensus-building. They foster collaboration, mentor junior colleagues, and focus on driving impactful outcomes aligned with organizational goals.",
      },
      leadershipTalentMgmt: {
        criteria: "Typically responsible for providing guidance, coaching and training to other team members within the job area. Typically responsible for managing major/complex projects at this level, involving delegation of work and review of work products.",
        expectedBehaviors: "Excels in their technical or functional expertise, acting as mentors and influencers. They lead by guiding peers, sharing knowledge, and contributing to team achievements. They may support talent management through mentoring, training, and participating in recruitment. Their leadership fosters collaboration, learning, and operational excellence within their area of expertise.",
      },
    },
  },
  {
    id: "p5",
    level: 5,
    track: "ic",
    code: "P5",
    title: "Master",
    description: "Recognized master in professional discipline. Implements strategic goals. Problems typically undefined and/or complex.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires mastery level knowledge of the job area typically obtained through advanced education combined with experience. May have deep knowledge of project management. Typically requires a University Degree or equivalent experience and minimum 12 years of prior relevant experience; or Master's degree with 8 years; or PhD with 5 years of experience.",
        expectedBehaviors: "Has an advanced technical expertise and extensive experience in their field. They solve complex problems, drive innovation, mentor more junior team members, and contribute to strategic decisions. They should effectively communicate complex concepts and stay updated with industry trends to maintain high proficiency.",
      },
      organizationalImpact: {
        criteria: "Implements strategic goals established by functional leadership. Establishes operational plans for the job area with short-to mid-term impact on results (e.g., 1-2 years). Provides measurable input into new products, processes, standards and/or operational plans that will have some impact on the achievement of overall function results.",
        expectedBehaviors: "Makes a substantial organizational impact. They consistently deliver high-quality work, solve complex problems independently, and are mentoring proactively more junior team members. Their contributions drive team and organizational goals, leading to improved processes and innovative solutions. They also influence strategic decisions within their domain, demonstrating leadership and effective collaboration across teams.",
      },
      innovationComplexity: {
        criteria: "Responsible for improving upon existing processes and systems using significant conceptualizing, reasoning and interpretation. Problems and issues faced are numerous, typically undefined where information is difficult to obtain. Conducts extensive investigation to understand the root cause of problems. Problems span a wide range of difficult and unique issues across functions and/or businesses.",
        expectedBehaviors: "Excels in innovation and complexity management. They consistently innovate, proposing novel solutions and creative approaches that drive significant impact. They adeptly handle complex tasks independently, demonstrating deep domain expertise and leadership in pioneering new methods or technologies. Their work simplifies complexity, making advanced concepts accessible and applicable across their organization.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of its own job function, and typically has responsibilities for communicating with parties external to the organization, which may include customers or vendors. Works to influence others to accept job function's view/practices and agree/accept new concepts, practices, and approaches. Requires ability to communicate with executive leadership regarding matters of significant importance to the organization.",
        expectedBehaviors: "Highly knowledgeable and experienced in their specialized field. They excel at handling complex tasks independently, offering expert guidance, and contributing strategically. They are respected for their deep expertise and proactive approach to staying current in their field.",
      },
      leadershipTalentMgmt: {
        criteria: "Frequently responsible for providing guidance, coaching and training to other team members across the Company within an area of expertise. Typically responsible for managing large, complex project initiatives of strategic importance to the organization, involving large cross-functional teams.",
        expectedBehaviors: "Expected to exhibit leadership qualities by mentoring colleagues, fostering teamwork, and contributing strategically. They should manage talent effectively through knowledge sharing, constructive feedback, and active participation in organizational initiatives, setting a high standard for performance and professional growth.",
      },
    },
  },
  {
    id: "p6",
    level: 6,
    track: "ic",
    code: "P6",
    title: "Thought Leader",
    description: "Recognized internally and externally as thought leader. Recommends strategies to leadership. Requires highest mastery of multiple job areas.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires highest knowledge and mastery of multiple job areas typically obtained through advanced education combined with experience. Viewed as the leading expert and/or resource within the field by peers within and outside the organization. Typically requires a University Degree or equivalent experience and minimum 15 years of prior relevant experience; or Master's degree with 12 years; or PhD with 8 years.",
        expectedBehaviors: "Has a deep expertise and extensive experience in their field, with a proven track record of solving complex problems and leading technical projects. They should mentor peers, influence their team, and stay updated on industry trends, contributing strategically to their organization.",
      },
      organizationalImpact: {
        criteria: "Recommends operational plans and strategies that will directly impact the achievement of overall functional results. Establishes operational plans for the job area with short-to mid-term impact on results (e.g., 1-2 years).",
        expectedBehaviors: "Highly skilled and independent, making significant contributions to projects and strategies that impact the organization broadly. They lead complex initiatives, innovate, and solve critical problems, influencing both their team and other parts of the organization. At this level, contributors are respected for their deep expertise and ability to deliver high-quality results that align with organizational goals. Additionally, they develop groundbreaking ideas, setting external trends and establishing the organization as a leader in their field.",
      },
      innovationComplexity: {
        criteria: "Responsible for improving upon existing processes and systems using significant conceptualizing, reasoning and interpretation. Solutions are novel and unique and draw upon best practices based on expertise. Problems and issues faced are often complex, requiring broad-based consideration of variables that impact multiple areas of the organization. Extensively analyzes problems to seek understanding of the root cause of the problem.",
        expectedBehaviors: "Excels in innovation and complexity management. They generate novel solutions, tackle complex problems adeptly, and navigate ambiguity effectively. Their work drives significant impact, influences strategy, and fosters significant innovation within their team or organization, aligning closely with long-term goals and market trends.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of its own job function, and typically has responsibilities for communicating with parties external to the organization, which may include customers or vendors. Works to influence others to accept job function's view/practices and agree/accept new concepts, practices, and approaches. Requires ability to communicate and influence senior executive leadership regarding matters of strategic importance to the organization.",
        expectedBehaviors: "Expected to possess deep expertise and extensive knowledge in their field. They consistently deliver high-quality work independently, innovate solutions, and serve as influential mentors within their organization. They actively contribute to knowledge-sharing initiatives and demonstrate a track record of significant contributions to projects, setting benchmarks in their industry.",
      },
      leadershipTalentMgmt: {
        criteria: "Responsible for providing guidance, coaching and training to other team members across the Company within an area of expertise. Typically responsible for managing large, complex project initiatives of strategic importance to the organization, involving large cross-functional teams. May lead small teams but not people manager responsibility.",
        expectedBehaviors: "Excels in mentoring, providing feedback, and fostering teamwork. They proactively identify and develop talent, align team goals with strategic objectives, and inspire others through their leadership and innovation. Their role is crucial in creating a collaborative and inclusive workplace environment.",
      },
    },
  },
  // ============================================
  // PEOPLE MANAGERS (M1 - M6)
  // ============================================
  {
    id: "m1",
    level: 1,
    track: "manager",
    code: "M1",
    title: "Supervise Support Roles",
    description: "Supervises support roles. Set day-to-day goals for team members. Problems faced typically not complex.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Understands basic management approaches such as work scheduling, prioritizing, coaching and process execution. Typically requires broad job knowledge of technical or operational practices within assigned discipline. Typically requires no advanced education and 3-5 years minimum prior relevant experience.",
        expectedBehaviors: "Understands basic management approaches and has broad knowledge of assigned discipline with 3-5 years experience.",
      },
      organizationalImpact: {
        criteria: "Plans and establishes operational objectives for a team of support personnel within a clearly defined job area. Delivers operational results that have moderate impact on the achievement of departmental results. Assigns tasks to a team to achieve operational targets, service standards, etc. Typically does not have budget, but may manage day-to-day elements of the budget (e.g., overtime for staff).",
        expectedBehaviors: "Supervises support teams, focusing on maintaining workflow and resolving operational decisions.",
      },
      innovationComplexity: {
        criteria: "Responsible for making adjustments or recommended enhancements in systems and processes to solve problems or improve effectiveness of the job area. Problems and issues faced are general, and may require understanding of a broader set of issues, but typically are not complex. Problems may require understanding of other job areas. Problems are typically solved through drawing from prior experiences, with analysis of the issue.",
        expectedBehaviors: "Makes adjustments to solve general problems, drawing from prior experience.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function, which may include external customers or vendors depending upon the job function. Explains policies, practices and procedures of the area of responsibility to others within the organization. May work to justify and gain cooperation of other parties on practices, policies and procedures.",
        expectedBehaviors: "Communicates policies within and outside the team and provides input on personnel decisions.",
      },
      leadershipTalentMgmt: {
        criteria: "Supervises a team consisting of support level members. Provides day-to-day work direction for the team, focused on maintaining steady workflow and productivity and resolving operational decisions. Provides primary input to hiring, termination, promotion, performance and rewards decisions for direct reports.",
        expectedBehaviors: "Supervises support teams, focusing on maintaining workflow and resolving operational decisions. Requires basic management knowledge. Communicates policies within and outside the team and provides input on personnel decisions.",
      },
    },
  },
  {
    id: "m2",
    level: 2,
    track: "manager",
    code: "M2",
    title: "Supervise Individual Contributors",
    description: "Supervises individual contributors, typically at entry or inexperienced level. Sets goals for team members aligning to operational goals. Understands basic management skills.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Understands basic management approaches such as work scheduling, prioritizing, coaching and process execution. Typically requires advanced knowledge of the job area typically obtained through advanced education combined with experience. Typically requires a University Degree or equivalent experience and minimum 3-5 years prior relevant experience.",
        expectedBehaviors: "Understands basic management approaches and has advanced knowledge of job area with 3-5 years experience and university education.",
      },
      organizationalImpact: {
        criteria: "Plans and establishes goals and objectives for a team, with direct impact on the immediate- or short-term operational results of the department. Typically does not have budget accountability, but may manage day-to-day elements of the budget (e.g., overtime for staff).",
        expectedBehaviors: "Leads entry-level individual contributors, establishing short-term goals and operational plans.",
      },
      innovationComplexity: {
        criteria: "Responsible for making improvements of processes, systems or products to enhance performance of the job area. Problems and issues faced are difficult, and may require understanding of a broader set of issues. Problems typically involve consideration of multiple issues, job areas or specialties. Problems are typically solved through drawing from prior experience and analysis of issues.",
        expectedBehaviors: "Makes improvements to solve difficult problems involving multiple areas.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function, external customers or vendors depending upon the job function. Explains policies, practices and procedures of the job area to others within the organization. May work to justify and gain cooperation of other parties on practices, policies and procedures.",
        expectedBehaviors: "Communicates policies and practices within and outside the team and influences cooperation on procedures.",
      },
      leadershipTalentMgmt: {
        criteria: "Supervises a team consisting of professionals, typically at the entry or inexperienced level. Leads, directs and reviews the work of team members in order to accomplish operational plans and results. Provides primary input to hiring, termination, promotion, performance and rewards decisions for direct reports.",
        expectedBehaviors: "Leads entry-level individual contributors, establishing short-term goals and operational plans. Requires advanced job knowledge. Communicates policies and practices within and outside the team and influences cooperation on procedures.",
      },
    },
  },
  {
    id: "m3",
    level: 3,
    track: "manager",
    code: "M3",
    title: "Manage Individual Contributors",
    description: "Manages experienced individual contributors within a single discipline within business unit. Focus on short-term operations. Typically no budget responsibility.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires practical knowledge in leading and managing the execution of processes, projects and tactics within one job area. Typically has advanced knowledge and skills within a specific technical or professional discipline with understanding of the impact of work on other areas of the organization. Typically requires a University Degree or equivalent experience and minimum 7 years prior relevant experience.",
        expectedBehaviors: "Has practical knowledge in managing execution within one job area, with advanced technical/professional skills and 7+ years experience.",
      },
      organizationalImpact: {
        criteria: "Manages a team with focus on policy and strategy implementation. Establishes operational plans with measurable contribution towards the achievement of results of the job function. Focus is on short-term operational plans (e.g., less than 1 year). Provides measurable input to new products, processes, standards or operational plans in support of the job function strategy. Typically does not have budget accountability, but may manage certain processes or projects within a defined budget set by management.",
        expectedBehaviors: "Manages experienced individual contributors, focusing on short-term strategy implementation.",
      },
      innovationComplexity: {
        criteria: "Responsible for making moderate to significant improvements of processes, systems or products to enhance performance of the job area. Problems and issues faced are numerous and undefined, and require detailed information gathering, analysis and investigation to understand the problem. Problems are difficult and moderately complex. Problems typically impact multiple departments or specialties. Problems are typically solved through drawing from prior experience and analysis of issues.",
        expectedBehaviors: "Solves numerous and undefined problems that are difficult and moderately complex, impacting multiple departments.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function, which may include external customers or vendors depending upon the job function. Explains policies, practices and procedures of the job area to others within the organization. May work to justify and gain cooperation of other parties on practices, policies and procedures. Sometimes requires the ability to influence others outside of their own job area on policies, practices and procedures.",
        expectedBehaviors: "Communicates broadly, and provides input on hiring and performance.",
      },
      leadershipTalentMgmt: {
        criteria: "Manage a team consisting of professionals, typically at the experienced level or highly technical professionals. Leads, directs and reviews the work of team members in order to accomplish operational plans and results. Provides primary input to hiring, termination, promotion, performance and rewards decisions for direct reports.",
        expectedBehaviors: "Manages experienced individual contributors, focusing on short-term strategy implementation. Requires practical management knowledge. Solves moderately complex problems, communicates broadly, and provides input on hiring and performance.",
      },
    },
  },
  {
    id: "m4",
    level: 4,
    track: "manager",
    code: "M4",
    title: "Manage Large Team or High Impact Team",
    description: "Manage large or high impact teams of both individual contributors and managers. Focus on execution of operational goals. May have budget responsibility.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Requires broad management knowledge to lead project teams in one department. Typically has mastery level knowledge and skills within a specific technical or professional discipline with broad understanding of other areas within the job function. Typically requires a University Degree or equivalent experience and minimum 10 years prior relevant experience.",
        expectedBehaviors: "Has broad management knowledge and mastery within a technical/professional discipline with 10+ years experience.",
      },
      organizationalImpact: {
        criteria: "Establishes key elements of tactical and operational plans with measurable contribution towards the achievement of results of the sub-function. Focus is on short-to mid-term operational plans (e.g., 1-2 years). Develops new products, processes, standards or operational plans in support of the job function strategy. May have budget accountability.",
        expectedBehaviors: "Manages large or highly technical teams, responsible for tactical and operational plans towards the achievement of results of their sub-function.",
      },
      innovationComplexity: {
        criteria: "Responsible for making moderate to significant improvements of processes, systems or products to enhance performance of the job area. Problems and issues faced are numerous and undefined, and require detailed information gathering, analysis and investigation to understand the problem. Problems are difficult and moderately complex. Problems typically impact multiple departments or specialties. Problems are typically solved through drawing from prior experience and analysis of issues.",
        expectedBehaviors: "Handles numerous, undefined, difficult and moderately complex problems impacting multiple departments.",
      },
      communicationInfluence: {
        criteria: "Communicates with parties within and outside of their own job function, which may include external customers or vendors depending upon the job function. Requires ability to influence others outside of their own job area on policies, practices and procedures.",
        expectedBehaviors: "Communicates within and outside job function, influencing others on policies and practices.",
      },
      leadershipTalentMgmt: {
        criteria: "Manages a large team typically composed of other managers and/or supervisors and experienced or highly technical professionals. Typically has hiring, termination, promotion and reward authority within its own area, in accordance with manager review and approval.",
        expectedBehaviors: "Manages large or highly technical teams, responsible for tactical and operational plans with measurable contribution towards the achievement of results of their sub-function. Work requires a high degree of responsibility for resources, and frequently influences business decisions made by functional leadership.",
      },
    },
  },
  {
    id: "m5",
    level: 5,
    track: "manager",
    code: "M5",
    title: "Director",
    description: "Leads a function through strategic direction, impactful delivery, improving productivity and accountability, driving cross-functional alignment and outcomes, enhancing manager effectiveness, and developing talent. Sets function's annual objectives aligned with department strategy.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Expert knowledge (SME) of function(s)' domain in context of other functions, company, and competitive environment. Requires broad management and leadership knowledge to lead multiple job areas with mastery-level skills within a specific discipline and broad understanding of adjacent areas. Typically requires minimum 10 years prior relevant experience.",
        expectedBehaviors: "Demonstrates deep functional expertise and understands how their function connects to adjacent areas, the company, and the competitive landscape. Leads a function, delivering through Managers and Senior Managers.",
      },
      organizationalImpact: {
        criteria: "Leads a function, delivering through Managers/Sr. Managers. Sets function's annual objectives aligned with department strategy. Designs, optimizes, and scales functional structure to support growth. Drives continuous improvement of operations to enhance productivity and accountability. Makes timely, informed strategic decisions in the face of ambiguity. May have budget accountability for the function.",
        expectedBehaviors: "Sets annual objectives aligned with department strategy. Designs and scales functional structure for growth. Drives continuous improvement and makes strategic decisions in ambiguity. Establishes operational plans with short-to-mid-term impact (1-2 years).",
      },
      innovationComplexity: {
        criteria: "Responsible for moderate to significant improvements of processes, systems, or products. Problems are numerous and undefined, requiring detailed information gathering and analysis. Problems are difficult and moderately complex, typically impacting multiple departments or specialties. Designs, optimizes, and scales functional structure to support growth.",
        expectedBehaviors: "Makes timely, informed strategic decisions in the face of ambiguity. Drives continuous improvement and designs functional structure that supports growth and scale. Solves moderately complex problems that impact multiple departments.",
      },
      communicationInfluence: {
        criteria: "Trusted relationships with key cross-functional peers and teams. Aligns objectives and initiatives to drive collective outcomes. Communicates with parties within and outside of own job function, including external parties. Requires ability to communicate with executive leadership regarding matters of significant importance to the organization.",
        expectedBehaviors: "Builds trusted relationships with cross-functional peers to align objectives and drive collective outcomes. Communicates with executive leadership on matters of significant organizational importance.",
      },
      leadershipTalentMgmt: {
        criteria: "Develops Managers/Sr. Managers and proactively builds leadership bench to optimize talent to meet current business needs. Fosters a high-performance culture that reflects company values, inclusion, agility and ownership. Maintains a pulse on functional health and uses data insights to drive improvements to the employee experience function-wide.",
        expectedBehaviors: "Proactively builds a leadership bench and develops managers. Fosters a high-performance culture reflecting company values. Uses data insights to improve employee experience across the function.",
      },
    },
  },
  {
    id: "m6",
    level: 6,
    track: "manager",
    code: "M6",
    title: "Senior Director",
    description: "Leads function(s) through visionary direction, scalable delivery, and maturing operations. Drives cross-functional outcomes, talent strategy for future needs, and sets functional vision aligned with department strategy. Delivers through Sr. Managers and Directors.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Broad knowledge of function's domain, company, and competitive environment. Advanced management and leadership knowledge to lead cross-department project teams or manage across multiple functions. Typically has mastery within a specific technical area or broad expertise across multiple related disciplines. Minimum 12 years prior relevant experience.",
        expectedBehaviors: "Demonstrates broad knowledge of the function's domain and the competitive environment. Leads function(s), delivering through Sr. Managers/Directors. Sets functional vision aligned with department strategy.",
      },
      organizationalImpact: {
        criteria: "Leads function(s), delivering through Sr. Managers/Directors. Sets functional vision aligned with department strategy. Designs, optimizes and scales functional structure to support growth. Oversees maturation of operations, optimizing resource allocation and utilization. Makes strategic decisions in the face of ambiguity. May have budget responsibility for the area.",
        expectedBehaviors: "Sets functional vision aligned with department strategy. Oversees maturation of operations and optimizes resource allocation. Makes strategic decisions in ambiguity. Scales functional structure for growth.",
      },
      innovationComplexity: {
        criteria: "Responsible for improving upon entire processes or systems using significant conceptualizing, reasoning and interpretation skills. Problems are numerous, undefined, and frequently complex — information is typically difficult to obtain. Problems involve consideration of multiple sites, geographies, products or customers. Designs, optimizes and scales functional structure to support growth.",
        expectedBehaviors: "Makes strategic decisions in the face of ambiguity. Improves entire processes or systems, handling complex problems spanning multiple geographies, products, or customers. Designs and scales structure for growth.",
      },
      communicationInfluence: {
        criteria: "Trusted relationships with peers, VPs, stakeholders, external partners and customers. Company-first mindset, incorporating diverse perspectives. Communicates with parties within and outside of own job function and with executive leadership on matters of significant importance to the organization.",
        expectedBehaviors: "Builds trusted relationships with peers, VPs, and external stakeholders. Operates with a company-first mindset, incorporating diverse perspectives. Communicates on strategic matters with executive leadership.",
      },
      leadershipTalentMgmt: {
        criteria: "Develops Sr. Managers/Directors and builds leadership bench. Optimizes talent to meet evolving business needs. Cultivates culture that reflects company values, inclusion, agility, and ownership among leaders and teams. Uses data insights to enhance the employee experience function- and department-wide.",
        expectedBehaviors: "Develops senior leaders and builds a leadership bench for future needs. Cultivates culture and ownership among leaders and teams. Uses data insights to enhance employee experience across the function and department.",
      },
    },
  },
  // ============================================
  // SENIOR LEADERS / EXECUTIVES (VP / SVP)
  // ============================================
  {
    id: "vp",
    level: 7,
    track: "executive",
    code: "VP",
    title: "Vice President",
    description: "Drives company success by setting visionary direction, scalable delivery, operational maturity, cross-functional alignment, and shaping talent strategy for future growth. Leads department(s) delivering through Directors/Sr. Directors. Sets department vision aligned with company strategy.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Broad knowledge of department's domain, company, and competitive environment at local and global level. Deep functional expertise combined with strong business and strategic acumen. Broad understanding of how their department integrates with product, revenue, operations, and finance. Typically 15+ years of progressively responsible experience, including senior leadership roles.",
        expectedBehaviors: "Demonstrates broad knowledge of the department's domain and the competitive environment at local and global level. Leads department(s), delivering through Directors/Sr. Directors. Sets department vision aligned with company strategy.",
      },
      organizationalImpact: {
        criteria: "Leads department(s) delivering through Directors/Sr. Directors. Sets department vision aligned with company strategy. Designs department's long-term structure ensuring scalability for growth. Sets direction for operational excellence at next level of scale, identifying investment areas for sustainable growth. Makes decisions that balance risk with opportunity, benefit company and stakeholders, and withstand board-level scrutiny.",
        expectedBehaviors: "Sets department vision aligned with company strategy. Designs long-term departmental structure for scalability. Sets direction for operational excellence at scale. Makes decisions that balance risk and opportunity and withstand board-level scrutiny.",
      },
      innovationComplexity: {
        criteria: "Operates in highly ambiguous environments with incomplete or evolving data. Solves complex, cross-functional problems with material business impact. Designs department's long-term structure ensuring scalability for growth. Sets direction for operational excellence at the next level of scale, identifying investment areas for sustainable growth.",
        expectedBehaviors: "Operates in highly ambiguous environments, solving complex cross-functional problems with material business impact. Designs scalable structures and sets direction for operational excellence at scale.",
      },
      communicationInfluence: {
        criteria: "High-level relationships across company and industry, modeling a company-first mindset, identifying company-wide needs, challenges, and priorities. Trusted strategic partner to the CEO and executive leadership team. Regularly presents to the Board of Directors on department strategy, performance, risks, and opportunities. Represents the company externally with executives, investors, partners, and industry leaders.",
        expectedBehaviors: "Builds high-level relationships across the company and industry. Models a company-first mindset and identifies company-wide needs and priorities. Trusted strategic partner to the CEO. Regularly presents to the Board. Represents the company externally.",
      },
      leadershipTalentMgmt: {
        criteria: "Oversees departmental performance and develops Directors/Sr. Directors. Establishes succession for long-term company strategy. Defines high-performance culture and exemplifies company values through actions. Leads organization-level change aligned to company success.",
        expectedBehaviors: "Oversees departmental performance and develops Directors/Sr. Directors. Establishes succession for long-term strategy. Defines high-performance culture and exemplifies company values. Leads organization-level change aligned to company success.",
      },
    },
  },
  {
    id: "svp",
    level: 8,
    track: "executive",
    code: "SVP",
    title: "Senior Vice President",
    description: "Drives the company's strategic direction and operational excellence, proactively addressing market shifts and emerging opportunities. Ensures sustainable growth, alignment, and a values-driven culture across the organization. Leads department(s) delivering through Sr. Directors/VPs. Shapes org and company strategy.",
    dimensions: {
      knowledgeExperience: {
        criteria: "Broad knowledge of department(s)' domain, company, and competitive environment at local and global level. Broad, enterprise-level understanding of business strategy and operations. Deep leadership experience across multiple functions or complex business domains. Typically 18-20+ years of experience, including executive leadership roles. Proven ability to lead through scale, complexity, and organizational change.",
        expectedBehaviors: "Demonstrates broad knowledge of the department(s)' domain and the competitive environment at local and global level. Leads department(s), delivering through Sr. Directors/VPs. Shapes org and company strategy, anticipating and navigating market shifts and emerging trends.",
      },
      organizationalImpact: {
        criteria: "Leads department(s) delivering through Sr. Directors/Directors/VPs. Shapes org and company strategy. Anticipates and navigates market shifts, emerging trends. Evolves organizational structures across multiple departments, ensuring scalability, adaptability for company's growth trajectory. Sets direction for operational excellence and metrics at scale. Prioritizes investment opportunities for scalable growth. Makes decisions that balance risk with strategic opportunity, withstand board-level scrutiny, impact the company's trajectory, and produce long-term value.",
        expectedBehaviors: "Shapes org and company strategy. Evolves organizational structures across multiple departments for scalability. Sets direction for operational excellence at scale. Makes decisions that balance risk, withstand board-level scrutiny, and produce long-term enterprise value.",
      },
      innovationComplexity: {
        criteria: "Addresses the most complex, systemic challenges facing the company. Designs and evolves operating models across departments to support scale. Anticipates future organizational, market, and business needs. Makes tradeoffs across functions to optimize overall company performance. Evolves organizational structures across multiple departments ensuring scalability and adaptability.",
        expectedBehaviors: "Addresses the most complex systemic challenges facing the company. Evolves organizational structures and operating models across multiple departments. Anticipates future market and business needs. Makes cross-functional tradeoffs to optimize company performance.",
      },
      communicationInfluence: {
        criteria: "Enterprise-wide and industry relationships, modeling a company-first mindset and cross-functional priorities. Attracts strategic partners and customers through industry credibility. Partners closely with the CEO and executive team on enterprise strategy and execution. Drives alignment across executive leaders with differing priorities and constraints. Represents the company externally across multiple business areas.",
        expectedBehaviors: "Builds enterprise-wide and industry relationships. Models a company-first mindset at the highest level. Attracts strategic partners through industry credibility. Partners closely with the CEO on enterprise strategy. Drives alignment across executive leaders with differing priorities.",
      },
      leadershipTalentMgmt: {
        criteria: "Oversees departmental performance ensuring high performance. Builds world-class leadership bench, establishing succession to deliver long-term strategy and future business demands. Drives high-performance, values-driven culture, setting the tone through actions. Steers transformational change at the company level.",
        expectedBehaviors: "Builds a world-class leadership bench and establishes succession for long-term strategy. Drives high-performance, values-driven culture and sets the tone through actions. Steers transformational change at the company level.",
      },
    },
  },
];

// Helper functions
export function getLevelByCode(code: string): Level | undefined {
  return LEVELS.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export function getLevelsByTrack(track: TrackType): Level[] {
  return LEVELS.filter((l) => l.track === track);
}

export function getAllLevelCodes(): string[] {
  return LEVELS.map((l) => l.code);
}

export function getTrackLabel(track: TrackType): string {
  switch (track) {
    case "ic":
      return "Individual Contributor";
    case "manager":
      return "People Manager";
    case "executive":
      return "Executive Leadership";
  }
}

export function getLevelGuideText(): string {
  let text = "# Tiger Data Job Leveling Guide\n\n";

  for (const level of LEVELS) {
    text += `## ${level.code} - ${level.title} (${getTrackLabel(level.track)})\n`;
    text += `${level.description}\n\n`;

    for (const [key, label] of Object.entries(DIMENSION_LABELS)) {
      const dim = level.dimensions[key as keyof typeof level.dimensions];
      text += `### ${label}\n`;
      text += `**Criteria:** ${dim.criteria}\n`;
      text += `**Expected Behaviors:** ${dim.expectedBehaviors}\n\n`;
    }
    text += "---\n\n";
  }

  return text;
}
