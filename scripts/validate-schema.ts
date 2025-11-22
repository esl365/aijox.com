/**
 * Database Schema Validation Script
 *
 * Validates the Prisma schema for:
 * - Missing indexes on frequently queried fields
 * - Proper relationship definitions
 * - Cascade delete configurations
 * - Data type consistency
 * - Enum completeness
 *
 * Usage: tsx scripts/validate-schema.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  category: string;
  model?: string;
  field?: string;
  message: string;
  recommendation?: string;
}

class SchemaValidator {
  private schema: string;
  private issues: ValidationIssue[] = [];

  constructor(schemaPath: string) {
    this.schema = readFileSync(schemaPath, 'utf-8');
  }

  validate(): ValidationIssue[] {
    console.log('🔍 Validating Prisma Schema...\n');

    this.checkIndexes();
    this.checkRelationships();
    this.checkEnums();
    this.checkDataTypes();
    this.checkCascadeDeletes();
    this.checkRequiredFields();
    this.checkNamingConventions();

    return this.issues;
  }

  private addIssue(issue: ValidationIssue) {
    this.issues.push(issue);
  }

  private checkIndexes() {
    console.log('📊 Checking indexes...');

    // Check User table indexes
    if (!this.schema.includes('@@index([email])') && !this.schema.includes('email         String    @unique')) {
      // Email is @unique, so it's automatically indexed - OK
    }

    // Check for common query patterns that should be indexed
    const indexChecks = [
      {
        model: 'JobPosting',
        patterns: [
          { fields: ['status', 'country'], found: this.schema.includes('@@index([status, country])') },
          { fields: ['subject'], found: this.schema.includes('@@index([subject])') },
        ]
      },
      {
        model: 'Application',
        patterns: [
          { fields: ['status'], found: this.schema.includes('@@index([status])') },
          { fields: ['jobId', 'teacherId'], found: this.schema.includes('@@unique([jobId, teacherId])') },
        ]
      },
      {
        model: 'TeacherProfile',
        patterns: [
          { fields: ['status', 'profileCompleteness'], found: this.schema.includes('@@index([status, profileCompleteness])') },
          { fields: ['searchRank'], found: this.schema.includes('@@index([searchRank])') },
        ]
      },
    ];

    indexChecks.forEach(({ model, patterns }) => {
      patterns.forEach(({ fields, found }) => {
        if (!found) {
          this.addIssue({
            severity: 'WARNING',
            category: 'Performance',
            model,
            message: `Missing index on [${fields.join(', ')}]`,
            recommendation: `Add @@index([${fields.join(', ')}]) to improve query performance`,
          });
        }
      });
    });

    // Check for timestamps that might need indexing
    if (!this.schema.match(/@@index\(\[createdAt\]\)/g)) {
      this.addIssue({
        severity: 'INFO',
        category: 'Performance',
        message: 'Consider adding indexes on createdAt fields for time-based queries',
        recommendation: 'Add @@index([createdAt]) to models with frequent time-based filtering',
      });
    }
  }

  private checkRelationships() {
    console.log('🔗 Checking relationships...');

    // Check for orphaned foreign keys
    const relationChecks = [
      { relation: 'teacherId', target: 'TeacherProfile', model: 'Application' },
      { relation: 'jobId', target: 'JobPosting', model: 'Application' },
      { relation: 'schoolId', target: 'SchoolProfile', model: 'JobPosting' },
      { relation: 'userId', target: 'User', model: 'TeacherProfile' },
      { relation: 'userId', target: 'User', model: 'SchoolProfile' },
      { relation: 'userId', target: 'User', model: 'RecruiterProfile' },
    ];

    relationChecks.forEach(({ relation, target, model }) => {
      const relationPattern = new RegExp(`${relation}.*@relation.*${target}`, 's');
      if (!relationPattern.test(this.schema)) {
        this.addIssue({
          severity: 'WARNING',
          category: 'Relationships',
          model,
          field: relation,
          message: `Verify relationship to ${target} is properly defined`,
        });
      }
    });
  }

  private checkEnums() {
    console.log('📋 Checking enums...');

    // Extract all enum definitions
    const enumPattern = /enum\s+(\w+)\s*\{([^}]+)\}/g;
    const enums = new Map<string, string[]>();

    let match;
    while ((match = enumPattern.exec(this.schema)) !== null) {
      const enumName = match[1];
      const values = match[2]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'));
      enums.set(enumName, values);
    }

    console.log(`  Found ${enums.size} enums:`);
    enums.forEach((values, name) => {
      console.log(`    - ${name}: ${values.length} values`);
    });

    // Check for string fields that should be enums
    const statusFieldsWithoutEnum = this.schema.match(/status\s+String/g);
    if (statusFieldsWithoutEnum && statusFieldsWithoutEnum.length > 0) {
      this.addIssue({
        severity: 'WARNING',
        category: 'Data Integrity',
        message: `Found ${statusFieldsWithoutEnum.length} 'status' fields using String instead of enum`,
        recommendation: 'Consider converting String status fields to enums for type safety',
      });
    }
  }

  private checkDataTypes() {
    console.log('🔢 Checking data types...');

    // Check for potential precision issues
    const floatPattern = /Float/g;
    const floatMatches = this.schema.match(floatPattern);
    if (floatMatches && floatMatches.length > 0) {
      this.addIssue({
        severity: 'INFO',
        category: 'Data Types',
        message: `Found ${floatMatches.length} Float fields`,
        recommendation: 'Verify Float precision is sufficient; consider Decimal for currency',
      });
    }

    // Check for Decimal usage in currency fields
    const salaryPattern = /salary.*Int/gi;
    if (salaryPattern.test(this.schema)) {
      this.addIssue({
        severity: 'INFO',
        category: 'Data Types',
        message: 'Salary fields use Int type (stored in USD)',
        recommendation: 'Current Int usage is OK for USD amounts; consider Decimal if sub-dollar precision needed',
      });
    }

    // Check for email fields
    const emailPattern = /email\s+String(?!\s+@unique)/g;
    const emailMatches = this.schema.match(emailPattern);
    if (emailMatches && emailMatches.length > 1) {
      this.addIssue({
        severity: 'INFO',
        category: 'Data Types',
        message: 'Multiple email fields without @unique constraint',
        recommendation: 'Verify if non-unique email fields are intentional',
      });
    }
  }

  private checkCascadeDeletes() {
    console.log('🗑️  Checking cascade delete configurations...');

    // Check for relationships without onDelete
    const relationWithoutCascade = /relation\(fields:.*?\)(?!.*onDelete)/g;
    const matches = this.schema.match(relationWithoutCascade);

    if (matches && matches.length > 0) {
      this.addIssue({
        severity: 'WARNING',
        category: 'Data Integrity',
        message: `Found ${matches.length} relations without explicit onDelete behavior`,
        recommendation: 'Add onDelete: Cascade, SetNull, or Restrict to all relations',
      });
    }

    // Verify critical cascades exist
    const criticalCascades = [
      { relation: 'userId', model: 'TeacherProfile', expected: 'Cascade' },
      { relation: 'userId', model: 'SchoolProfile', expected: 'Cascade' },
      { relation: 'userId', model: 'RecruiterProfile', expected: 'Cascade' },
      { relation: 'jobId', model: 'Application', expected: 'Cascade' },
      { relation: 'teacherId', model: 'Application', expected: 'Cascade' },
    ];

    criticalCascades.forEach(({ relation, model, expected }) => {
      const cascadePattern = new RegExp(`${relation}.*onDelete:\\s*${expected}`, 's');
      if (!cascadePattern.test(this.schema)) {
        this.addIssue({
          severity: 'ERROR',
          category: 'Data Integrity',
          model,
          field: relation,
          message: `Missing or incorrect onDelete: ${expected}`,
          recommendation: `Add onDelete: ${expected} to prevent orphaned records`,
        });
      }
    });
  }

  private checkRequiredFields() {
    console.log('✅ Checking required fields...');

    // Check core models have required fields
    const requiredFieldChecks = [
      { model: 'User', field: 'email', required: true },
      { model: 'User', field: 'role', required: true },
      { model: 'TeacherProfile', field: 'firstName', required: true },
      { model: 'TeacherProfile', field: 'lastName', required: true },
      { model: 'SchoolProfile', field: 'schoolName', required: true },
      { model: 'JobPosting', field: 'title', required: true },
      { model: 'JobPosting', field: 'salaryUSD', required: true },
      { model: 'Application', field: 'jobId', required: true },
      { model: 'Application', field: 'teacherId', required: true },
    ];

    requiredFieldChecks.forEach(({ model, field, required }) => {
      const fieldPattern = new RegExp(`model\\s+${model}[^}]*${field}\\s+\\w+\\??`, 's');
      const match = this.schema.match(fieldPattern);

      if (match) {
        const isOptional = match[0].includes('?');
        if (required && isOptional) {
          this.addIssue({
            severity: 'WARNING',
            category: 'Data Integrity',
            model,
            field,
            message: `Critical field '${field}' is optional`,
            recommendation: `Consider making '${field}' required`,
          });
        }
      }
    });
  }

  private checkNamingConventions() {
    console.log('📝 Checking naming conventions...');

    // Check for consistent naming
    const modelPattern = /model\s+([A-Z]\w+)/g;
    let modelMatch;
    while ((modelMatch = modelPattern.exec(this.schema)) !== null) {
      const modelName = modelMatch[1];

      // Check PascalCase
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(modelName)) {
        this.addIssue({
          severity: 'WARNING',
          category: 'Code Style',
          model: modelName,
          message: 'Model name should be in PascalCase',
        });
      }
    }

    // Check for consistent field naming
    const fieldPattern = /^\s+([a-z]\w+)\s+/gm;
    const fields = new Set<string>();
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(this.schema)) !== null) {
      fields.add(fieldMatch[1]);
    }

    // Check for camelCase
    fields.forEach(field => {
      if (!/^[a-z][a-zA-Z0-9]*$/.test(field) && field !== 'id') {
        this.addIssue({
          severity: 'INFO',
          category: 'Code Style',
          field,
          message: `Field '${field}' doesn't follow camelCase convention`,
        });
      }
    });
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 SCHEMA VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    const errors = this.issues.filter(i => i.severity === 'ERROR');
    const warnings = this.issues.filter(i => i.severity === 'WARNING');
    const info = this.issues.filter(i => i.severity === 'INFO');

    console.log(`Summary:`);
    console.log(`  ❌ Errors:   ${errors.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ℹ️  Info:     ${info.length}`);
    console.log('');

    if (errors.length > 0) {
      console.log('❌ ERRORS:\n');
      errors.forEach((issue, index) => {
        this.printIssue(issue, index + 1);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:\n');
      warnings.forEach((issue, index) => {
        this.printIssue(issue, index + 1);
      });
    }

    if (info.length > 0) {
      console.log('\nℹ️  INFORMATION:\n');
      info.forEach((issue, index) => {
        this.printIssue(issue, index + 1);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✨ Validation Complete');
    console.log('='.repeat(80) + '\n');

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Schema validation passed! No critical issues found.\n');
    } else if (errors.length === 0) {
      console.log('⚠️  Schema is functional but has some warnings to review.\n');
    } else {
      console.log('❌ Schema has critical errors that should be addressed.\n');
      process.exit(1);
    }
  }

  private printIssue(issue: ValidationIssue, index: number) {
    console.log(`${index}. [${issue.category}]${issue.model ? ` ${issue.model}` : ''}${issue.field ? `.${issue.field}` : ''}`);
    console.log(`   ${issue.message}`);
    if (issue.recommendation) {
      console.log(`   💡 ${issue.recommendation}`);
    }
    console.log('');
  }
}

// Main execution
const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma');
const validator = new SchemaValidator(schemaPath);
const issues = validator.validate();
validator.printReport();
