"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

// Services
import { UserService, UserServiceToken } from "../user/services/user.service";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";

// DTOs
import { UpdateUserRequestDto, UserResponseDto } from "../user/dtos/user.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// PrimeReact Imports
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask"; // Optional for phone formatting

export default function ProfilePage() {
  const userService = container.get<UserService>(UserServiceToken);
  const cookieService = container.get<CookieService>(CookieServiceToken);

  const toast = useRef<Toast>(null);

  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Edit Dialog State ---
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequestDto>(
    new UpdateUserRequestDto()
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);

    const loginInfo = cookieService.getJwtLoginInfo();
    const userId = loginInfo?.userId;
    const orgId = loginInfo?.activeOrg?.id;

    if (!userId || !orgId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "User session or Active Organization not found",
      });
      setLoading(false);
      return;
    }

    const res = await userService.getUserDetails(userId, orgId);

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setUser(res);
    }
    setLoading(false);
  };

  // --- Edit Logic ---
  const openEditDialog = () => {
    if (!user) return;
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      // We generally don't want users editing their own Role/Status in profile
      roleId: user.roleId,
      menuTemplateId: user.menuTemplateId,
      disabled: user.disabled,
      super: user.super as boolean,
    });
    setShowEditDialog(true);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);

    // Call API: PATCH /users/{userId}/organization/{orgId}
    // Note: The existing userService.updateUser handles the logic of getting orgId internally
    // or we might need to verify if we need to pass orgId explicitly depending on your service implementation.
    // Assuming userService.updateUser(userId, dto) uses the active org from cookies (as implemented previously).

    const res = await userService.updateUser(user.id, formData);

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
      });
      setShowEditDialog(false);
      // Reload profile to reflect changes
      loadUserProfile();
    }
    setSaving(false);
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${
      user.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="grid p-fluid p-4">
        <div className="col-12 md:col-6 md:col-offset-3">
          <Card className="shadow-2 border-round">
            <div className="flex align-items-center gap-3 mb-4">
              <Skeleton shape="circle" size="4rem" />
              <div className="flex-1">
                <Skeleton width="60%" className="mb-2" />
                <Skeleton width="40%" />
              </div>
            </div>
            <Skeleton height="150px" />
          </Card>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowEditDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleUpdateProfile}
        loading={saving}
        autoFocus
      />
    </div>
  );

  return (
    <div className="grid p-fluid p-4">
      <Toast ref={toast} />

      {/* Centered Profile Card */}
      <div className="col-12 md:col-6 md:col-offset-3">
        <Card className="shadow-2 border-round surface-card p-0">
          {/* Header Section */}
          <div className="flex flex-column align-items-center mb-5 text-center pt-3">
            <Avatar
              label={getInitials()}
              size="xlarge"
              shape="circle"
              className="mb-3 surface-100 text-900 border-1 surface-border"
              style={{ width: "80px", height: "80px", fontSize: "2rem" }}
            />
            <h2 className="m-0 text-900 font-medium mb-1">{user.email}</h2>

            <div className="mt-2 flex gap-2">
              <Tag
                severity={user.super ? "danger" : "warning"}
                value={user.super ? "Super" : "Regular"}
                icon={user.super ? "pi pi-check" : "pi pi-times"}
                rounded
              ></Tag>
              <Tag
                severity={user.verified ? "success" : "warning"}
                value={user.verified ? "Verified" : "Unverified"}
                icon={user.verified ? "pi pi-check" : "pi pi-times"}
                rounded
              ></Tag>
              {!user.disabled ? (
                <Tag severity="success" value="Active Account" rounded></Tag>
              ) : (
                <Tag severity="danger" value="Disabled" rounded></Tag>
              )}
            </div>
          </div>

          {/* Details List */}
          <div className="px-4 pb-4">
            <div className="text-500 font-medium mb-3 mt-4">
              Personal Information
            </div>
            <ul className="list-none p-0 m-0">
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">First Name</span>
                <span className="text-900 font-bold">
                  {user.firstName || "N/A"}
                </span>
              </li>
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">Last Name</span>
                <span className="text-900 font-bold">
                  {user.lastName || "N/A"}
                </span>
              </li>
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">Contact Number</span>
                <span className="text-900 font-bold">
                  {user.contactNumber || "N/A"}
                </span>
              </li>
            </ul>

            <div className="text-500 font-medium mb-3 mt-4">System Access</div>
            <ul className="list-none p-0 m-0">
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">Role</span>
                <span className="text-900 font-bold">
                  {user.roleName || "N/A"}
                </span>
              </li>
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">Menu Template</span>
                <span className="text-900 font-bold">
                  {user.menuTemplateName || "N/A"}
                </span>
              </li>
              <li className="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
                <span className="text-500">User ID</span>
                <span className="text-900 font-bold">#{user.id}</span>
              </li>
            </ul>

            <div className="flex justify-content-center align-items-center mt-5">
              <Button
                icon="pi pi-user-edit"
                label="Edit Profile"
                raised
                onClick={openEditDialog}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* --- Edit Profile Dialog --- */}
      <Dialog
        header="Edit Personal Information"
        visible={showEditDialog}
        style={{ width: "400px" }}
        footer={dialogFooter}
        onHide={() => setShowEditDialog(false)}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="fname" className="font-bold">
              First Name
            </label>
            <InputText
              id="fname"
              value={formData.firstName || ""}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="lname" className="font-bold">
              Last Name
            </label>
            <InputText
              id="lname"
              value={formData.lastName || ""}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="contact" className="font-bold">
              Contact Number
            </label>
            <InputText
              id="contact"
              value={formData.contactNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
